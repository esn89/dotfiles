/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../lib/vendor/parseuri.js*/
/*jsl:import ../lib/utils.js*/
/*jsl:import ../lib/bugdb.js*/
/*jsl:import ../lib/conf.js*/
/*jsl:import ../lib/surrogatedb.js*/

var VERSION = JSON.parse(syncGet(chrome.extension.getURL('manifest.json'))).version;

// are we running for the first time/upgrading?
var JUST_INSTALLED = !localStorage.previousVersion,
	JUST_UPGRADED = localStorage.previousVersion != window.VERSION && !window.JUST_INSTALLED,
	JUST_UPDATED = false,
	upgrade_alert_shown = true;
localStorage.previousVersion = window.VERSION;

// tab_id: { bug_id: { blocked: boolean, sources: array of { src: string, blocked: boolean } } }
var foundBugs = {};

// tab_id: { url: string, host: string, sids: array of surrogate script IDs, DOMLoaded: boolean }
var tabInfo = {};

// censusCache[Y-m-d][location.host + location.pathname][bug_id] = 1
// note: censusCache is not persisted
var censusCache = {},
	preCensusCache = {};

// tracker latencies (unblocked requests belonging to trackers)
// { request_id: { start_time: string, bug_id: int } }
var latencies = {};

var conf = loadConf();

function clearTabData(tab_id) {
	delete window.foundBugs[tab_id];
	delete tabInfo[tab_id];
}

function insertSurrogates(tab_id, type, bug_id, app_id, src) {
	var ti = window.tabInfo[tab_id],
		surrogates,
		code;

	if (type == 'site') {
		surrogates = window.surrogatedb.getForSite(ti.host);
	} else {
		surrogates = window.surrogatedb.getForTracker(
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

		chrome.tabs.sendRequest(tab_id, {
			msg: 'surrogate',
			surrogate: code
		});
	}
}

function init() {
	// initialize trackers and surrogates

	loadBugList();

	window.surrogatedb.init();

	chrome.browserAction.setBadgeBackgroundColor({ color: [51, 0, 51, 230] });

	if (!!(!window.conf.ghostrank && !prefs('walkthroughAborted') && !prefs('walkthroughFinished'))) {
		chrome.tabs.create({
			url: chrome.extension.getURL('walkthrough.html')
		});
	}

	chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
		var msg = request.msg;

		if (msg == 'openWalkthrough') {
			chrome.tabs.create({
				url: chrome.extension.getURL('walkthrough.html')
			});
		} else if (msg == 'showNewTrackers') {
			chrome.tabs.create({
				url: chrome.extension.getURL('options.html#new_trackers')
			});
		} else if (msg == 'recordPageInfo') {
			recordPageInfo(request.domain, request.latency, request.spots);
		} else if (msg == 'pageInjected') {
			// TODO doesn't always happen?
			insertSurrogates(sender.tab.id, 'site');
		}

		sendResponse({});
	});

	chrome.tabs.onRemoved.addListener(clearTabData);

	chrome.tabs.onActiveChanged.addListener(function (tab_id, selectInfo) {
		updateButton(tab_id);
	});

	function onNavigationUpdateButton(deets) {
		if (deets.frameId === 0) { // tab content window navigation
			updateButton(deets.tabId);
		}
	}

	// webNavigation events are closely related to navigation state in the UI,
	// which makes them better suited for updating the browser button and badge
	chrome.webNavigation.onCommitted.addListener(onNavigationUpdateButton);
	chrome.webNavigation.onReferenceFragmentUpdated.addListener(onNavigationUpdateButton);

	chrome.webNavigation.onDOMContentLoaded.addListener(function (deets) {
		// top-level documents and valid tabs only
		if (deets.frameId !== 0 || deets.tabId <= 0) { // TODO is the deets.tabId check necessary?
			return;
		}

		// show alert bubble only after DOM has loaded
		tabInfo[deets.tabId].DOMLoaded = true;
		if (window.conf.show_alert) {
			if (!window.JUST_UPGRADED || window.upgrade_alert_shown) {
				showAlert(deets.tabId);
			}
		}

		// show upgrade notifications
		getActiveTab(function (tab) {
			if (tab.id != deets.tabId || tab.incognito) {
				return;
			}

			if (window.JUST_UPGRADED && !window.upgrade_alert_shown) {
				var msg = 'showUpgradeAlert';

				// GhostRank is off and we've already dismissed or finished the walkthrough
				if (!window.conf.ghostrank && (prefs('walkthroughAborted') || prefs('walkthroughFinished'))) {
					msg = 'showWalkthroughAlert';
				}

				chrome.tabs.sendRequest(deets.tabId, {
					msg: msg
				}, function (response) {
					// not all tabs will have content scripts loaded, so better wait for confirmation first
					// TODO no longer necessary?
					window.upgrade_alert_shown = true;
				});

			} else if (window.JUST_UPDATED) {
				if (window.conf.notify_library_updates) {
					chrome.tabs.sendRequest(deets.tabId, {
						msg: 'showUpdateAlert'
					}, function (response) {
						window.JUST_UPDATED = false;
					});
				} else {
					window.JUST_UPDATED = false;
				}
			}
		});

		// perform page-level GhostRank, but only if the page had some trackers on it
		if (window.conf.ghostrank && getFoundAppsCount(deets.tabId) > 0) {
			chrome.tabs.get(deets.tabId, function (tab) {
				if (tab && !tab.incognito) {
					chrome.tabs.executeScript(tab.id, {
						file: 'includes/page_info.js',
						runAt: 'document_idle'
					});
				}
			});
		}
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

	if (!window.conf.ghostrank) {
		return;
	}

	if (!window.latencies.hasOwnProperty(request_id)) {
		return;
	}

	var latency = -1;
	if (success) {
		latency = Math.round(deets.timeStamp - window.latencies[request_id].start_time);
	}

	chrome.tabs.get(tab_id, function (tab) {
		// don't need to check for incognito here since we check when saving
		// start times in window.latencies
		recordStats(
			tab.url,
			deets.url,
			window.latencies[request_id].bug_id,
			latency
		);

		// TODO doesn't always get cleared
		// TODO (try nytimes.com pages w/ unblocked Brightcove, or evidon.com & Evidon Notice)
		delete window.latencies[request_id];
	});
}

// Listen for completed webRequests. Calculate latency and recordStats() if enabled
chrome.webRequest.onCompleted.addListener(function (deets) {
	logLatency(deets, true);
}, {
	urls: ['http://*/*', 'https://*/*']
});

// Listen for error webRequests. Set latency = -1 and recordStats() if enabled
chrome.webRequest.onErrorOccurred.addListener(function (deets) {
	logLatency(deets, false);
}, {
	urls: ['http://*/*', 'https://*/*']
});

// TODO THIS HAS TO BE SUPER FAST
// TODO speed this up by making it asynchronous when blocking is disabled?
// TODO also speed it up for blocking-whitelisted pages (by delaying isBug scanning)?
function onBeforeRequest(deets) {
	var tab_id = deets.tabId,
		request_id = deets.requestId;

	if (tab_id <= 0) {
		return;
	}

	if (deets.type == 'main_frame') {
		log("❤ ❤ ❤ Tab %s navigating to %s ❤ ❤ ❤", tab_id, deets.url);

		window.foundBugs[tab_id] = {};

		window.tabInfo[tab_id] = {
			url: deets.url,
			host: parseUri(deets.url).host,
			sids: [],
			DOMLoaded: false
		};

		onNavigate(deets.url); // GhostRank's onNavigate

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

	if (!window.tabInfo.hasOwnProperty(tab_id)) {
		log("tabInfo not found for tab %s", tab_id);
		return;
	}

	var bug_id,
		app_id,
		page_url = window.tabInfo[tab_id].url,
		page_host = window.tabInfo[tab_id].host;

	// ignore image resources coming from the top-level domain of the page being scanned
	if (deets.type == 'image' && deets.url.replace(/^http[s]?:\/\//, '').indexOf(page_host) === 0) {
		return;
	}

	// NOTE: not currently limiting to certain request types, as before:
	//if (el.nodeName != "EMBED" && el.nodeName != 'IFRAME' && el.nodeName != 'IMG' && el.nodeName != 'OBJECT' && el.nodeName != 'SCRIPT') {
	//	return;
	//}

	bug_id = isBug(deets.url);

	if (!bug_id) {

		return;
	}

	app_id = window.bugdb.bugs[bug_id].aid;

	var block = !window.conf.paused_blocking && !whitelisted(page_url) &&
		window.conf.selected_app_ids.hasOwnProperty(app_id);

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
			if (window.conf.ghostrank && !tab.incognito) {
				if (block) {
					// if bug is blocked, it never loads so latency is redundant: set to -1.
					recordStats(tab.url, deets.url, bug_id, -1);
				} else {
					// if bug is not blocked, register latency start
					window.latencies[request_id] = {
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

// TODO THIS HAS TO BE SUPER FAST
// TODO move up
function isBug(src) {
	var i,
		id,
		priorities = ['high', 'regular', 'low'],
		regexes,
		q;

	if (!window.bugdb.fullRegex.test(src)) {
		return false;
	}

	// strip out the querystring, including the ?, to reduce false positives
	q = src.indexOf('?');
	if (q >= 0) {
		src = src.slice(0, q);
	}

	for (i = 0; i < priorities.length; i++) {
		regexes = window.bugdb.regexes[priorities[i]];

		for (id in regexes) {
			// note: no hasOwnProperty check since our code is sandboxed

			// TODO can still produce false positives (when something that
			// TODO matches a tracker is in the path somewhere, for example)
			if (regexes[id].test(src)) {
				return id;
			}
		}
	}

	return false;
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

	if (window.conf.show_alert) {
		num_apps_old = getFoundAppsCount(tab_id);
	}

	updateFoundBugs(tab_id, bug_id, url, block);

	updateButton(tab_id);

	// we only inject at top-level, so don't bother looking up
	// non-top-level scripts
	if (block && type == 'script' && !deets.from_frame) {
		insertSurrogates(tab_id, 'tracker', bug_id, app_id, url);
	}

	if (window.conf.show_alert) {
		if (!window.JUST_UPGRADED || window.upgrade_alert_shown) {
			if (tabInfo[tab_id].DOMLoaded && getFoundAppsCount(tab_id) > num_apps_old) {
				showAlert(tab_id);
			}
		}
	}
}

function updateFoundBugs(tab_id, bug_id, src, blocked) {
	if (window.foundBugs[tab_id] === undefined) {
		window.foundBugs[tab_id] = {};
	}
	if (window.foundBugs[tab_id].hasOwnProperty(bug_id)) {
		window.foundBugs[tab_id][bug_id].sources.push({
			src: src,
			blocked: blocked
		});
	} else {
		window.foundBugs[tab_id][bug_id] = {
			blocked: blocked,
			sources: [{ src: src, blocked: blocked }]
		};
	}
}

function getFoundBugs(tab_id) {
	return window.foundBugs.hasOwnProperty(tab_id) && window.foundBugs[tab_id];
}

// convert a hash of bugs into an array of apps
function getFoundApps(tab_id, sorted) {
	var apps_arr = [],
		apps_obj = {},
		bugs = getFoundBugs(tab_id),
		id,
		aid;

	if (!bugs) {
		return bugs;
	}

	// squish all the bugs into apps first
	for (id in bugs) {
		// note: no hasOwnProperty check since our code is sandboxed
		aid = window.bugdb.bugs[id].aid;
		if (apps_obj.hasOwnProperty(aid)) {
			// combine bug sources
			apps_obj[aid].sources = apps_obj[aid].sources.concat(bugs[id].sources);
		} else {
			apps_obj[aid] = {
				id: aid,
				name: window.bugdb.bugs[id].name,
				blocked: bugs[id].blocked,
				sources: bugs[id].sources
			};
		}
	}

	// convert apps hash to array
	for (id in apps_obj) {
		// note: no hasOwnProperty check since our code is sandboxed
		apps_arr.push(apps_obj[id]);
	}

	if (sorted) {
		apps_arr.sort(function (a, b) {
			a = a.name.toLowerCase();
			b = b.name.toLowerCase();
			return (a > b ? 1 : (a < b ? -1 : 0));
		});
	}

	return apps_arr;
}

function getFoundAppsCount(tab_id) {
	var apps = getFoundApps(tab_id);
	if (apps) {
		return apps.length;
	}
	return 0;
}

function getToday() {
	var now = new Date();
	return now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
}

function cleanCaches() {
	var today = getToday();

	[window.censusCache, window.preCensusCache].forEach(function (cache, i) {
		for (var id in cache) {
			if (cache.hasOwnProperty(id)) {
				if (id != today) {
					log("Cleaned up %s.",
						(i == 1 ? 'preCensusCache': 'censusCache'));
					delete cache[id];
				}
			}
		}
	});
}

// every thirty minutes
setInterval(cleanCaches, 1800000);

function setCache(cache, date, bug_id, url) {
	if (!cache[date]) {
		cache[date] = {};
	}

	if (!cache[date][url]) {
		cache[date][url] = {};
	}

	cache[date][url][bug_id] = 1;
}

function onNavigate(url) {
	var today = getToday(),
		parsedURL = parseUri(url),
		host_with_pathname = parsedURL.host + (parsedURL.port ? ':' + parsedURL.port : '') + parsedURL.path;

	if (!window.preCensusCache.hasOwnProperty(today) ||
		!window.preCensusCache[today].hasOwnProperty(host_with_pathname)) {
		return;
	}

	// move the bug IDs from preCensusCache to censusCache

	_.keys(window.preCensusCache[today][host_with_pathname]).forEach(function (bug_id) {
		setCache(window.censusCache, today, bug_id, host_with_pathname);
	});

	delete window.preCensusCache[today][host_with_pathname];
}

function recordStats(tab_url, bug_url, bug_id, latency) {
	var today = getToday(),
		bug = window.bugdb.bugs[bug_id],
		is_selected = window.conf.selected_app_ids.hasOwnProperty(bug.aid),
		parsedURL = parseUri(tab_url),
		host_with_pathname = parsedURL.host + (parsedURL.port ? ':' + parsedURL.port : '') + parsedURL.path,
		census_url,
		xhr;

	// record only if current [host_with_pathname]:[web bug] has not already been submitted for today
	if (window.censusCache.hasOwnProperty(today) &&
		window.censusCache[today].hasOwnProperty(host_with_pathname) &&
		window.censusCache[today][host_with_pathname].hasOwnProperty(bug_id)) {
		return;
	}

	census_url = 'https://l.ghostery.com/api/census' +
		'?bid=' + encodeURIComponent(bug.aid) + // company app ID
		'&apid=' + encodeURIComponent(bug_id) + // app pattern ID
		'&d=' + encodeURIComponent(host_with_pathname) +
		'&src=' + encodeURIComponent(bug_url) +
		// bl: should this bug have gotten blocked after taking all settings into account?
		// TODO should be able to replace with what we actually did ("blocked" in foundBugs?)
		'&bl=' + ((!window.conf.paused_blocking && !whitelisted(tab_url) && is_selected) ? 'true' : 'false') +
		// blm: blocking mode: 1 means "block all", 0 means "block selected", -1 means "off"
		'&blm=' + (window.bugdb.noneSelected ? '-1' : (window.bugdb.allSelected ? '1' : '0')) +
		// bs: is the bug selected for blocking (regardless of whether we are blocking)?
		'&bs=' + (is_selected ? 'true' : 'false') +
		// nl: network latency
		'&nl=' + latency +
		// bv: bug library version
		'&bv=' + encodeURIComponent(window.bugdb.version) +
		// cv: caching scheme version
		'&cv=2' +
		'&ua=chrome' +
		'&v=' + encodeURIComponent(window.VERSION);

	log('XHR to ' + census_url);

	xhr = new XMLHttpRequest();
	xhr.open("GET", census_url, true);
	xhr.send();

	setCache(window.preCensusCache, today, bug_id, host_with_pathname);
}

// records page domain, latency, # of adSpots, UA.
function recordPageInfo(domain, page_latency, ad_spots) {
	if (!window.conf.ghostrank) {
		return;
	}

	var xhr,
		page_info_url = 'https://l.ghostery.com/api/page/' +
			'?d=' + encodeURIComponent(domain) +
			'&l=' + page_latency +
			'&s=' + ad_spots +
			'&ua=chrome';

	log('XHR to ' + page_info_url);

	xhr = new XMLHttpRequest();
	xhr.open("GET", page_info_url, true);
	xhr.send();
}

function showAlert(tab_id) {
	var apps = getFoundApps(tab_id, true);
	if (apps && apps.length) {
		chrome.tabs.sendRequest(tab_id, {
			msg: "show",
			bugs: apps,
			alert_cfg: {
				pos_x: (window.conf.alert_bubble_pos.slice(1, 2) == 'r' ? 'right' : 'left'),
				pos_y: (window.conf.alert_bubble_pos.slice(0, 1) == 't' ? 'top' : 'bottom'),
				timeout: window.conf.alert_bubble_timeout
			}
		});
	}
}

function setIcon(active, tab_id) {
	chrome.browserAction.setIcon({
		path: 'images/' + (active ? 'icon16.png' : 'icon16_off.png'),
		tabId: tab_id
	});
}

function updateButton(tab_id) {
	var _updateButton = function (tab) {
		if (!tab) {
			return;
		}

		var tab_id = tab.id,
			text = getFoundAppsCount(tab_id).toString();

		if (!window.foundBugs.hasOwnProperty(tab_id)) {
			// no cached bug discovery data:
			// * Ghostery was enabled after the tab started loading
			// * or, this is a tab Ghostery's onBeforeRequest doesn't run in (non-http/https page)
			text = '';
		}

		chrome.browserAction.setBadgeText({
			text: text,
			tabId: tab_id
		});

		// gray-out the icon when blocking has been disabled for whatever reason
		if (text === '') {
			setIcon(false, tab_id);
		} else {
			setIcon(!window.conf.paused_blocking && !whitelisted(tab.url), tab_id);
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
	var i, num_sites = window.conf.site_whitelist.length;
	for (i = 0; i < num_sites; i++) {
		// TODO match from the beginning of the string to avoid false matches (somewhere in the querystring for instance)
		if (url.indexOf(window.conf.site_whitelist[i]) >= 0) {
			return window.conf.site_whitelist[i];
		}
	}
	return false;
}

// Flush Chrome's in-memory cache.
// GHOST-248: Debounced to run no more often than once every 35 seconds
// to avoid the "slow extension" warning.
// TODO should run once at start of period, and once at end?
// TODO use chrome.webRequest.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES (can default to 20 if undefined)
var flushChromeMemoryCache = _.debounce(function () {
	log("FLUSHING CHROME'S IN-MEMORY CACHE");
	chrome.webRequest.handlerBehaviorChanged();
}, 1000 * 35, true);

function autoUpdateBugDb() {
	// check and fetch (if needed) a new tracker library every 12 hours
	if (conf.enable_autoupdate) {
		if (!prefs('bugs_last_updated') ||
			(new Date()) > (new Date(+prefs('bugs_last_updated') + (1000 * 60 * 60 * 12)))) {
			loadBugList(true);
		}
	}
}

function pruneLatencies() {
	var now = +new Date();

	// clears any leftover latency records
	_.each(window.latencies, function (lat, reqId) {
		if ((now - window.latencies[reqId].start_time) > 300000) {
			log("Clearing orphan latencies ...");
			delete window.latencies[reqId];
		}
	});
}

setInterval(function () {
	autoUpdateBugDb();
	pruneLatencies();
}, 300000); // run every five minutes

window.addEventListener("load", init, false);
