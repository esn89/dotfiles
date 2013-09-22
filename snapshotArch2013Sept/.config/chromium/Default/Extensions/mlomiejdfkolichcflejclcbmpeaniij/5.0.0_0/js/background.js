/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

require([
	'jquery',
	'underscore',
	'parseuri',
	'lib/bugdb',
	'lib/click2play',
	'lib/compatibility',
	'lib/conf',
	'lib/dispatcher',
	'lib/foundbugs',
	'lib/ghostrank',
	'lib/i18n',
	'lib/matcher',
	'lib/surrogatedb',
	'lib/tabinfo',
	'lib/utils',
	'tpl/click2play'
], function ($, _, parseUri, bugDb, c2pDb, compDb, conf, dispatcher, foundBugs, ghostrank, i18n, matcher, surrogatedb, tabInfo, utils, c2p_tpl) {

	var prefs = utils.prefs,
		log = utils.log,
		upgrade_alert_shown = false,
		// Chrome 20-25 uses chrome.extension.sendMessage, Chrome >= 26 uses chrome.runtime.sendMessage
		// TODO verify on Chrome 23-25 (our minimum version is now 23)
		onMessage = chrome.runtime && chrome.runtime.onMessage || chrome.extension.onMessage;

	// expose the dispatcher for panel/options/walkthrough communication
	window.dispatcher = dispatcher;

	// are we running for the first time/upgrading?
	// TODO move into init()?
	var JUST_INSTALLED = !localStorage.previousVersion,
		JUST_UPGRADED = localStorage.previousVersion != utils.VERSION && !JUST_INSTALLED;
	localStorage.previousVersion = utils.VERSION;

	// tracker latencies (unblocked requests belonging to trackers)
	// { request_id: { start_time: string, bug_id: int } }
	var latencies = {};

	function clearTabData(tab_id) {
		foundBugs.clear(tab_id);
		tabInfo.clear(tab_id);
	}

	function insertSurrogates(tab_id, type, bug_id, app_id, src) {
		var ti = tabInfo.get(tab_id),
			surrogates,
			code;

		if (!ti || ti.partialScan) {
			return;
		}

		if (type == 'site') {
			surrogates = surrogatedb.getForSite(ti.host);
		} else {
			surrogates = surrogatedb.getForTracker(
				src,
				app_id,
				bug_id,
				ti.host
			);
		}

		code = _.reduce(surrogates, function (memo, s) {
			// don't surrogate the same script multiple times
			if (ti.sids.indexOf(s.sid) == -1) {
				ti.sids.push(s.sid);
				memo += s.code;
			}
			return memo;
		}, '');

		if (code) {
			log('SURROGATE [%s] for %s found: %s',
				type.toUpperCase(), ti.host, code);

			chrome.tabs.sendMessage(tab_id, {
				name: 'surrogate',
				message: {
					surrogate: code
				}
			});
		}
	}

	// TODO check the ordering of items within
	function init() {
		// initialize trackers and surrogates

		// TODO
		i18n.init(conf.language);

		bugDb.init(JUST_UPGRADED);
		c2pDb.init(JUST_UPGRADED);
		compDb.init(JUST_UPGRADED);

		// TODO check that dispatcher still works when conf is used by the panel/options page
		// TODO do we need these, or should we instead pull in the modules in conf.js? does that create a circ. dependency?
		dispatcher.on('conf.save.selected_app_ids', function (v) {
			var num_selected = _.size(v),
				db = bugDb.db;
			db.noneSelected = (num_selected === 0);
			db.allSelected = (!!num_selected && num_selected == _.size(db.apps));
		});
		dispatcher.on('conf.save.site_whitelist', function () {
			// TODO why aren't these in Safari?
			// TODO debounce with below
			updateButton();
			utils.flushChromeMemoryCache();
		});
		dispatcher.on('conf.save.paused_blocking', function () {
			// TODO debounce with above
			updateButton();
			utils.flushChromeMemoryCache();
		});
		dispatcher.on('conf.save.language', function (v) {
			i18n.init(v);
		});

		dispatcher.on('panelLoaded', function () {
			// TODO verify that these findings panel messages are always for the active tab
			// TODO verify that tabInfo will always have the stuff we need for the active tab ID
			utils.getActiveTab(function (tab) {
				var data = {
					trackers: foundBugs.getApps(tab.id, false, tab.url),
					conf: conf.toJSON(),
					page: {
						url: tab.url,
						host: tabInfo.get(tab.id).host
					},
					whitelisted: whitelisted(tab.url),
					pauseBlocking: conf.paused_blocking,
					needsReload: (tabInfo.get(tab.id) ? tabInfo.get(tab.id).needsReload : 0),
					showTutorial: !utils.prefs('panelTutorialShown'),
					// TODO "validProtocol" doesn't really apply to chrome, does it?
					validProtocol: (tab.url.indexOf('http') === 0 && foundBugs.getBugs(tab.id) !== false),
					language: conf.language
				};

				dispatcher.trigger('panelData', data);
			});
		});

		dispatcher.on('panelSelectedAppsUpdate', function (message) {
			if (message.app_selected) {
				conf.selected_app_ids[message.app_id] = 1;
			} else {
				delete conf.selected_app_ids[message.app_id];
			}
		});

		dispatcher.on('panelSiteWhitelistToggle', function () {
			utils.getActiveTab(function (tab) {
				var whitelisted_url = whitelisted(tabInfo.get(tab.id).url),
					hostname = tabInfo.get(tab.id).host;

				if (whitelisted_url) {
					conf.site_whitelist.splice(conf.site_whitelist.indexOf(whitelisted_url), 1);
				} else if (hostname) {
					conf.site_whitelist.push(hostname);
				}
			});
		});

		dispatcher.on('panelSiteSpecificUnblockUpdate', function (message) {
			utils.getActiveTab(function (tab) {
				var unblock = message.siteSpecificUnblocked,
					app_id = +message.app_id,
					host = tabInfo.get(tab.id).host;

				if (!unblock) {
					if (conf.site_specific_unblocks.hasOwnProperty(host) && conf.site_specific_unblocks[host].indexOf(app_id) >= 0) {
						conf.site_specific_unblocks[host].splice(conf.site_specific_unblocks[host].indexOf(app_id), 1);

						if (conf.site_specific_unblocks[host].length === 0) {
							delete conf.site_specific_unblocks[host];
						}
					}
				} else {
					if (!conf.site_specific_unblocks.hasOwnProperty(host)) {
						conf.site_specific_unblocks[host] = [];
					}

					if (conf.site_specific_unblocks[host].indexOf(app_id) == -1) {
						conf.site_specific_unblocks[host].push(app_id);
					}
				}
			});
		});

		dispatcher.on('panelPauseToggle', function () {
			conf.paused_blocking = !conf.paused_blocking;
		});

		dispatcher.on('panelShowTutorialSeen', function () {
			prefs('panelTutorialShown', true);
		});

		dispatcher.on('needsReload', function (message) {
			utils.getActiveTab(function (tab) {
				// TODO do we need the check?
				if (tabInfo.get(tab.id)) {
					tabInfo.get(tab.id).needsReload = message.needsReload;
				}
			});
		});

		dispatcher.on('reloadTab', function () {
			utils.getActiveTab(function (tab) {
				chrome.tabs.sendMessage(tab.id, {
					name: 'reload'
				});
			});
		});

		dispatcher.on('optionsLoaded', function () {
			dispatcher.trigger('optionsData', {
				db: bugDb.db,
				bugs_last_updated: prefs('bugs_last_updated'),
				conf: conf.toJSON(),
				new_app_ids: prefs('newAppIds'),
				VERSION: utils.VERSION
			});
		});

		function saveOptions(message) {
			$.each(conf.toJSON(), function (setting) {
				if (typeof message[setting] != 'undefined') {
					conf[setting] = message[setting];
				}
			});
		}
		dispatcher.on('optionsSave', saveOptions);
		dispatcher.on('walkthroughSave', saveOptions);

		dispatcher.on('walkthroughAborted', function () {
			prefs('walkthroughAborted', true);
		});

		dispatcher.on('walkthroughFinished', function () {
			prefs('walkthroughFinished', true);
		});

		dispatcher.on('optionsUpdateBugList', function () {
			bugDb.update(function (result) {
				dispatcher.trigger('optionsBugListUpdated', {
					db: bugDb.db,
					bugs_last_updated: prefs('bugs_last_updated'),
					conf: conf.toJSON(),
					new_app_ids: prefs('newAppIds'),
					success: result
				});
			});
			c2pDb.update();
			compDb.update();
		});

		chrome.browserAction.setBadgeBackgroundColor({ color: [51, 0, 51, 230] });

		if (!!(!conf.ghostrank && !prefs('walkthroughAborted') && !prefs('walkthroughFinished'))) {
			chrome.tabs.create({
				url: chrome.extension.getURL('walkthrough.html')
			});
		}

		onMessage.addListener(function (request, sender, sendResponse) {
			var name = request.name,
				message = request.message,
				tab = sender.tab,
				tab_id = tab && tab.id;

			// TODO
			/*
			if (!tab_id) {
				sendResponse({});
				return;
			}
			*/

			if (name == 'openWalkthrough') {
				chrome.tabs.create({
					url: chrome.extension.getURL('walkthrough.html')
				});

			} else if (name == 'showNewTrackers') {
				chrome.tabs.create({
					url: chrome.extension.getURL('options.html#new_trackers')
				});

			} else if (name == 'recordPageInfo') {
				ghostrank.recordPage(message.domain, message.latency, message.spots);

			} else if (name == 'pageInjected') {
				// TODO c2p
				// the rest is for top-level documents only
				//if (message.from_frame) {
				//	return;
				//}

				if (!conf.paused_blocking && !whitelisted(tab.url)) {
					insertSurrogates(tab_id, 'site');
				}

			} else if (name == 'processC2P') {
				if (message.action == 'always') {
					message.app_ids.forEach(function (aid) {
						if (conf.selected_app_ids.hasOwnProperty(aid)) {
							delete conf.selected_app_ids[aid];
						}
					});
					chrome.tabs.sendMessage(tab_id, {
						name: 'reload'
					});

				} else if (message.action == 'once') {
					c2pDb.allowOnce(message.app_ids, tab_id);
					chrome.tabs.sendMessage(tab_id, {
						name: 'reload'
					});
				}
			}

			sendResponse({});
		});

		chrome.tabs.onRemoved.addListener(clearTabData);

		chrome.tabs.onActiveChanged.addListener(function (tab_id) {
			updateButton(tab_id);
		});

		// does the details object belong to a top-level document and a valid tab?
		function isValidTopLevelNavigation(deets) {
			var url = deets.url;

			return deets.frameId === 0 &&
				deets.tabId > 0 &&
				url.indexOf('http') === 0 &&
				// TODO note this in the "not scanned" text for Chrome
				url.indexOf('https://chrome.google.com/webstore/') !== 0;
		}

		function onNavigation(deets) {
			var tab_id = deets.tabId;

			if (!isValidTopLevelNavigation(deets)) {
				// handle navigation to Web Store from some other page (not from blank page/NTP)
				// TODO what other webRequest-restricted pages are out there?
				if (deets.url.indexOf('https://chrome.google.com/webstore/') === 0) {
					clearTabData(tab_id);
				}

				return;
			}

			c2pDb.reset(tab_id);

			// note that we were here from the start (not scanned vs. nothing found)
			foundBugs.update(tab_id);

			updateButton(tab_id);
		}

		// webNavigation events are closely related to navigation state in the UI,
		// which makes them better suited for updating the browser button and badge
		chrome.webNavigation.onCommitted.addListener(onNavigation);
		chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigation);
		if (chrome.webNavigation.onHistoryStateUpdated) {
			chrome.webNavigation.onHistoryStateUpdated.addListener(onNavigation);
		}
		// TODO onCreatedNavigationTarget?
		// TODO onTabReplaced?

		chrome.webNavigation.onDOMContentLoaded.addListener(function (deets) {
			var tab_id = deets.tabId;

			if (!isValidTopLevelNavigation(deets)) {
				return;
			}

			onDOMContentLoaded(tab_id);
		});
		
		chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {
			urls: ['http://*/*', 'https://*/*']
		}, ['blocking']);
	}

	/*
	TODO In some web sites (i.e. NYT.com, bug_id 967) one or more bugs will
	not go through the onCompleted or onErrorOccurred listeners
	(in some cases due to returning 302 redirections). These cases are ignored.
	*/

	function logLatency(deets, success) {
		var request_id = deets.requestId,
			tab_id = deets.tabId;

		if (!conf.ghostrank) {
			return;
		}

		if (!latencies.hasOwnProperty(request_id)) {
			return;
		}

		var latency = -1;
		if (success) {
			latency = Math.round(deets.timeStamp - latencies[request_id].start_time);
		}

		chrome.tabs.get(tab_id, function (tab) {
			// don't need to check for incognito here since we check when saving
			// start times in latencies
			ghostrank.record(
				tab.url,
				deets.url,
				latencies[request_id].bug_id,
				false,
				latency
			);

			// TODO doesn't always get cleared
			// TODO (try nytimes.com pages w/ unblocked Brightcove, or evidon.com & Evidon Notice)
			// TODO that's because webRequest.onCompleted fires before we populate latencies, I bet
			delete latencies[request_id];
		});
	}

	// Listen for completed webRequests. Calculate latency and send GR if enabled.
	chrome.webRequest.onCompleted.addListener(function (deets) {
		logLatency(deets, true);
	}, {
		urls: ['http://*/*', 'https://*/*']
	});

	// Listen for error webRequests. Set latency = -1 and send GR if enabled.
	chrome.webRequest.onErrorOccurred.addListener(function (deets) {
		logLatency(deets, false);
	}, {
		urls: ['http://*/*', 'https://*/*']
	});

	function onDOMContentLoaded(tab_id) {
		// show alert bubble only after DOM has loaded
		if (tabInfo.get(tab_id)) {
			tabInfo.get(tab_id).DOMLoaded = true;
		}
		if (conf.show_alert) {
			if (!JUST_UPGRADED || upgrade_alert_shown) {
				showAlert(tab_id);
			}
		}

		// show upgrade notifications
		utils.getActiveTab(function (tab) {
			if (tab.id != tab_id || tab.incognito) {
				return;
			}

			var alert_messages = [
				'dismiss',
				'notification_reminder1',
				'notification_reminder2',
				'notification_reminder_link',
				'notification_update',
				'notification_update_link',
				'notification_upgrade'
			];

			if (JUST_UPGRADED && !upgrade_alert_shown) {
				var name = 'showUpgradeAlert';

				// GhostRank is off and we've already dismissed or finished the walkthrough
				if (!conf.ghostrank && (prefs('walkthroughAborted') || prefs('walkthroughFinished'))) {
					name = 'showWalkthroughAlert';
				}

				chrome.tabs.sendMessage(tab_id, {
					name: name,
					message: {
						translations: _.object(_.map(alert_messages, function (key) { return [key, i18n.t(key)]; }))
					}
				}, function () {
					// not all tabs will have content scripts loaded, so better wait for confirmation first
					// TODO no longer necessary?
					upgrade_alert_shown = true;
				});

			} else if (bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS) {
				if (conf.notify_library_updates) {
					chrome.tabs.sendMessage(tab_id, {
						name: 'showUpdateAlert',
						message: {
							translations: _.object(_.map(alert_messages, function (key) { return [key, i18n.t(key)]; }))
						}
					}, function () {
						bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS = false;
					});
				} else {
					bugDb.db.JUST_UPDATED_WITH_NEW_TRACKERS = false;
				}
			}
		});

		// perform page-level GhostRank, but only if the page had some trackers on it
		// TODO document on wiki
		if (conf.ghostrank && foundBugs.getAppsCount(tab_id) > 0) {
			chrome.tabs.get(tab_id, function (tab) {
				if (tab && !tab.incognito && ghostrank.isValidUrl(parseUri(tab.url))) {
					chrome.tabs.executeScript(tab.id, {
						file: 'includes/page_info.js',
						runAt: 'document_idle'
					});
				}
			});
		}
	}

	// TODO THIS HAS TO BE SUPER FAST
	// TODO speed this up by making it asynchronous when blocking is disabled?
	// TODO also speed it up for blocking-whitelisted pages (by delaying isBug scanning)?
	function onBeforeRequest(deets) {
		var tab_id = deets.tabId,
			request_id = deets.requestId;

		if (tab_id <= 0) {
			return;
		}

		// note: this is likely to not be ready in time
		// for pages being reopened on browser startup
		if (deets.type == 'main_frame') {
			// TODO GHOST-833 handle pushState navigation properly
			log("❤ ❤ ❤ Tab %s navigating to %s ❤ ❤ ❤", tab_id, deets.url);

			// TODO in safari:
			/*
			// handle reloads
			if (current_url == nav_url) {
				clearTabData(tab_id);
			}
			*/
			clearTabData(tab_id);

			tabInfo.create(tab_id, deets.url);

			ghostrank.onNavigate(deets.url);

			// TODO crbug.com/141716 and 93646
			// Workaround for foundBugs/tabInfo memory leak when the user triggers
			// prefetching/prerendering but never loads the page. Wait two minutes
			// and check whether the tab doesn't exist.
			setTimeout(function () {
				chrome.tabs.get(tab_id, function (tab) {
					if (!tab) {
						log('Clearing orphan tab data for tab %s', tab_id);
						clearTabData(tab_id);
					}
				});
			}, 120000);

			return;
		}

		if (!tabInfo.get(tab_id)) {
			log("tabInfo not found for tab %s, initializing ...", tab_id);

			// TODO expose partialScan in the UI somehow?
			tabInfo.create(tab_id);

			chrome.tabs.get(tab_id, function (tab) {
				var ti = tabInfo.get(tab_id);
				if (ti && ti.partialScan) {
					ti.url = tab.url;
					ti.host = parseUri(tab.url).host;
				}
			});
		}

		var bug_id,
			app_id,
			page_url = tabInfo.get(tab_id).url,
			page_host = tabInfo.get(tab_id).host;

		// NOTE: not currently limiting to certain request types, as before:
		//if (el.nodeName != "EMBED" && el.nodeName != 'IFRAME' && el.nodeName != 'IMG' && el.nodeName != 'OBJECT' && el.nodeName != 'SCRIPT') {
		//	return;
		//}

		bug_id = (page_url ?
			matcher.isBug(deets.url, page_url) :
			matcher.isBug(deets.url));

		if (!bug_id) {
			return;
		}

		app_id = bugDb.db.bugs[bug_id].aid;

		// TODO order of these matters for performance
		var block = !conf.paused_blocking &&

			conf.selected_app_ids.hasOwnProperty(app_id) &&

			// site-specific unblocking
			// page URL might be unavailable
			// TODO verify
			(!page_host || !conf.site_specific_unblocks.hasOwnProperty(page_host) ||
				conf.site_specific_unblocks[page_host].indexOf(+app_id) == -1) &&

			// page URL might be unavailable
			(!page_url || !whitelisted(page_url)) &&

			// TODO verify
			!c2pDb.allowedOnce(tab_id, app_id);

		// process the tracker asynchronously
		// v. important to block request processing as little as necessary
		setTimeout(function () {
			processBug({
				bug_id: bug_id,
				app_id: app_id,
				type: deets.type,
				url: deets.url,
				block: block,
				tab_id: tab_id,
				from_frame: deets.parentFrameId != -1
			});

			// TODO crbug.com/141716 and 93646
			// TODO Handle Omnibox prefetching, which produces requests
			// TODO with tab IDs that do not correspond to a valid tab object.
			chrome.tabs.get(tab_id, function (tab) {
				if (!tab) {
					return;
				}
				if (conf.ghostrank && !tab.incognito) {
					if (block) {
						// if bug is blocked, it never loads so latency is redundant: set to -1.
						ghostrank.record(tab.url, deets.url, bug_id, true, -1);
					} else {
						// if bug is not blocked, register latency start
						latencies[request_id] = {
							start_time: deets.timeStamp,
							bug_id: bug_id
						};
					}
				}
			});
		}, 1);

		if (block) {
			if (deets.type == 'sub_frame') {
				return { redirectUrl: 'about:blank' };
			} else if (deets.type == 'image') {
				return {
					// send PNG (and not GIF) to avoid conflicts with Adblock Plus
					redirectUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
				};
			}
		}

		return { cancel: block };
	}

	function processBug(deets) {
		var bug_id = deets.bug_id,
			app_id = deets.app_id,
			type = deets.type,
			url = deets.url,
			block = deets.block,
			tab_id = deets.tab_id,
			num_apps_old;

		log('');
		log((block ? 'Blocked' : 'Found') + " [%s] %s", type, url);
		log('^^^ Pattern ID %s on tab ID %s', bug_id, tab_id);

		if (conf.show_alert) {
			num_apps_old = foundBugs.getAppsCount(tab_id);
		}

		foundBugs.update(tab_id, bug_id, url, block, type);

		updateButton(tab_id);

		// we only inject at top-level, so don't bother looking up
		// non-top-level scripts
		if (block && type == 'script' && !deets.from_frame) {
			insertSurrogates(tab_id, 'tracker', bug_id, app_id, url);
		}

		if (block && conf.enable_click2play) {
			sendC2PData(tab_id, app_id);
		}

		if (conf.show_alert) {
			if (!JUST_UPGRADED || upgrade_alert_shown) {
				if (tabInfo.get(tab_id) && tabInfo.get(tab_id).DOMLoaded) {
					if (foundBugs.getAppsCount(tab_id) > num_apps_old ||
						c2pDb.allowedOnce(tab_id, app_id)) {
						showAlert(tab_id);
					}
				}
			}
		}
	}

	function sendC2PData(tab_id, app_id) {
		var c2pApp = c2pDb.db.apps[app_id];

		if (!c2pApp) {
			return;
		}

		// click-to-play for social buttons might be disabled
		if (!conf.enable_click2play_social) {
			c2pApp = _.reject(c2pApp, function (c2pAppDef) {
				return !!c2pAppDef.button;
			});
		}

		if (!c2pApp.length) {
			return;
		}

		var app_name = bugDb.db.apps[app_id].name,
			c2pHtml = [];

		// generate the templates for each c2p definition (could be multiple for an app ID)
		// TODO move click2play into own file, with maybe the template function embedded in the file?
		c2pApp.forEach(function (c2pAppDef) {
			var tplData = {
				button: !!c2pAppDef.button,
				ghostery_blocked_src: chrome.extension.getURL("images/click2play/ghosty_blocked.png"),
				allow_always_src: chrome.extension.getURL("images/click2play/allow_unblock.png")
			};

			if (c2pAppDef.button) {
				tplData.allow_once_title = i18n.t('click2play_allow_once_button_tooltip', app_name);
				tplData.allow_once_src = chrome.extension.getURL('images/click2play/' + c2pAppDef.button);
			} else {
				tplData.allow_once_title = i18n.t('click2play_allow_once_tooltip');
				tplData.allow_once_src = chrome.extension.getURL('images/click2play/allow_once.png');

				tplData.ghostery_blocked_title = i18n.t('click2play_blocked', app_name);

				if (c2pAppDef.type == 'comment') {
					tplData.click2play_text = i18n.t('click2play_comment_form', app_name);
				}
			}

			c2pHtml.push(c2p_tpl(tplData));
		});

		// TODO top-level documents only for now: http://crbug.com/264286
		chrome.tabs.sendMessage(tab_id, {
			name: 'c2p',
			message: {
				app_id: app_id,
				data: c2pApp,
				html: c2pHtml
				//tabWindowId: message.tabWindowId
			}
		});
	}

	function showAlert(tab_id) {
		var apps = foundBugs.getApps(tab_id, true);
		if (apps && apps.length) {
			chrome.tabs.sendMessage(tab_id, {
				name: 'show',
				message: {
					bugs: apps,
					alert_cfg: {
						pos_x: (conf.alert_bubble_pos.slice(1, 2) == 'r' ? 'right' : 'left'),
						pos_y: (conf.alert_bubble_pos.slice(0, 1) == 't' ? 'top' : 'bottom'),
						timeout: conf.alert_bubble_timeout
					}
				}
			});
		}
	}

	function setIcon(active, tab_id) {
		chrome.browserAction.setIcon({
			path: {
				19: 'images/icon19' + (active ? '' : '_off') + '.png',
				38: 'images/icon38' + (active ? '' : '_off') + '.png'
			},
			tabId: tab_id
		});
	}

	function updateButton(tab_id) {
		var _updateButton = function (tab) {
			if (!tab) {
				return;
			}

			var tab_id = tab.id,
				text;

			if (foundBugs.getBugs(tab_id) === false) {
				// no cached bug discovery data:
				// * Ghostery was enabled after the tab started loading
				// * or, this is a tab onBeforeRequest doesn't run in (non-http/https page)
				text = '';
			} else {
				text = foundBugs.getAppsCount(tab_id).toString();
			}

			chrome.browserAction.setBadgeText({
				text: (conf.show_badge ? text : ''),
				tabId: tab_id
			});

			// gray-out the icon when blocking has been disabled for whatever reason
			if (text === '') {
				setIcon(false, tab_id);
			} else {
				setIcon(!conf.paused_blocking && !whitelisted(tab.url), tab_id);
			}
		};

		if (tab_id) {
			chrome.tabs.get(tab_id, _updateButton);
		} else {
			// no tab ID was provided: update all active tabs
			chrome.tabs.query({
				active: true
			}, function (tabs) {
				tabs.map(_updateButton);
			});
		}
	}

	// TODO speed up
	function whitelisted(url) {
		var i, num_sites = conf.site_whitelist.length;
		for (i = 0; i < num_sites; i++) {
			// TODO match from the beginning of the string to avoid false matches (somewhere in the querystring for instance)
			if (url.indexOf(conf.site_whitelist[i]) >= 0) {
				return conf.site_whitelist[i];
			}
		}
		return false;
	}

	function checkLibraryVersion() {
		var VERSION_CHECK_URL = "https://www.ghostery.com/update/version?format=json";

		// TODO this does not handle no response/404/bad JSON
		$.getJSON(VERSION_CHECK_URL, function (r) {
			bugDb.update(r.bugsVersion);
			c2pDb.update(r.click2playVersion);
			compDb.update(r.compatibilityVersion);
		});
	}

	function autoUpdateBugDb() {
		// check and fetch (if needed) a new tracker library every 12 hours
		if (conf.enable_autoupdate) {
			if (!prefs('bugs_last_updated') ||
				(new Date()) > (new Date(+prefs('bugs_last_updated') + (1000 * 60 * 60 * 12)))) {
				checkLibraryVersion();
			}
		}
	}

	function pruneLatencies() {
		var now = +new Date();

		// clears any leftover latency records
		_.each(latencies, function (lat, reqId) {
			if ((now - latencies[reqId].start_time) > 300000) {
				log("Clearing orphan latencies ...");
				delete latencies[reqId];
			}
		});
	}

	setInterval(function () {
		autoUpdateBugDb();
		pruneLatencies();
	}, 300000); // run every five minutes

	init();

});
