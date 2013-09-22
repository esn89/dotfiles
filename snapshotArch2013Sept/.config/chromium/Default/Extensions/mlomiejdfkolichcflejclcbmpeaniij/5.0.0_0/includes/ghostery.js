/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

// TODO slim down as much as possible
(function () {

	var ALERT_ID = id(),
		ALERT_TIMER,
		C2P_DATA = {},
		CSS_INJECTED = false,
		// all_frames is false in the manifest
		//IS_FRAME = (win.top != win),
		TRANSLATIONS = {},
		UPGRADE_ALERT_SHOWN = false,
		ce = chrome.extension,
		cr = chrome.runtime,
		doc = document,
		win = window,
		// Chrome 20-25 uses chrome.extension.sendMessage, Chrome >= 26 uses chrome.runtime.sendMessage
		onMessage = cr && cr.onMessage || ce.onMessage,
		sendMessage = function (name, msg) {
			return (cr && cr.sendMessage || ce.sendMessage)({
				name: name,
				message: msg
			});
		};

	function id() {
		var s = '';
		while (s.length < 32) {
			s += Math.random().toString(36).replace(/[^A-Za-z]/g, '');
		}
		return s;
	}

	function createEl(type) {
		return doc.createElement(type);
	}

	function br() {
		return createEl('br');
	}

	// arguments: parentElement, *childElements
	function appendChild(parent) {
		for (var i = 1; i < arguments.length; i++) {
			parent.appendChild(arguments[i]);
		}
	}

	function injectScript(src_url, source) {
		var script = createEl('script'),
			parent = win.top.document.documentElement;

		if (src_url) {
			script.src = src_url;
		} else {
			script.textContent = source;
		}

		parent.insertBefore(script, parent.firstChild);
	}

	function injectCSS() {
		var style = createEl('style'),
			imp = ' !important;';

		style.innerHTML =
			'#' + ALERT_ID + '{' +
				'border:solid 2px #fff' + imp +
				// TODO SVN blame this one
				'box-sizing:content-box' + imp +
				'color:#fff' + imp +
				'display:block' + imp +
				'height:auto' + imp +
				'margin:0' + imp +
				'opacity:0.9' + imp +
				'padding:7px 10px' + imp +
				'position:fixed' + imp +
				'visibility:visible' + imp +
				'width:auto' + imp +
				'z-index:2147483647' + imp +
				// TODO should we switch to non-prefixed ones?
				'-webkit-border-radius:5px' + imp +
				'-webkit-box-shadow:0px 0px 20px #000' + imp +
				// TODO SVN blame this one
				'-webkit-box-sizing:content-box' + imp +
			'}' +

			'.' + ALERT_ID + '-blocked{' +
				'color:#777' + imp +
				'display:inline' + imp +
				'text-decoration:line-through' + imp +
			'}' +

			'#' + ALERT_ID + ' br{display:block' + imp + '}' +

			'#' + ALERT_ID + ' span{background:transparent' + imp + '}' +

			'#' + ALERT_ID + ' div{' +
				'border:0' + imp +
				'margin:0' + imp +
				'padding:0' + imp +
				'width:auto' + imp +
				'letter-spacing:normal' + imp +
				'font:13px Arial,Helvetica' + imp +
				'text-align:left' + imp +
				'text-shadow:none' + imp +
				'text-transform:none' + imp +
				'word-spacing:normal' + imp +
			'}' +

			'#' + ALERT_ID + ' a{' +
				'font-weight:normal' + imp +
				'background:none' + imp +
				'text-decoration:underline' + imp +
				'color:#fff' + imp +
			'}' +

			'@media print{#' + ALERT_ID + '{display:none' + imp + '}}';

		appendChild(doc.getElementsByTagName('head')[0], style);
	}

	function removeAlert() {
		var el = doc.getElementById(ALERT_ID);
		if (el) {
			el.parentNode.removeChild(el);
		}
		clearTimeout(ALERT_TIMER);
	}

	function createAlertLink(href, text) {
		var link = createEl('a');
		link.style.color = '#fff';
		link.style.textDecoration = 'underline';
		link.style.border = 'none';
		link.href = href || '#';
		if (href) {
			link.target = '_blank';
		}
		appendChild(link, doc.createTextNode(text));
		return link;
	}

	function span(text, class_name) {
		var s = createEl('span');
		if (class_name) {
			s.className = class_name;
		}
		appendChild(s, doc.createTextNode(text));
		return s;
	}

	function createAlert(type, alert_cfg) {
		var alert_div = createEl('div');

		alert_div.id = ALERT_ID;

		alert_div.style.setProperty(
			(alert_cfg && alert_cfg.pos_x == 'left' ? 'left' : 'right'),
			'20px',
			'important');
		alert_div.style.setProperty(
			(alert_cfg && alert_cfg.pos_y == 'bottom' ? 'bottom' : 'top'),
			'15px',
			'important');
		alert_div.style.setProperty(
			'background',
			(type == 'showBugs' ? '#330033' : '#777'),
			'important');

		if (doc.getElementsByTagName('body')[0]) {
			appendChild(doc.body, alert_div);
		} else {
			appendChild(doc.getElementsByTagName('html')[0], alert_div);
		}

		if (type == 'showBugs') {
			alert_div.style.cursor = 'pointer';
			alert_div.addEventListener('click', function (e) {
				removeAlert();
				e.preventDefault();
			});
		}

		return alert_div;
	}

	function showAlert(type, bugs, alert_cfg) {
		// only tear down the frame for upgrade notifications/walkthrough reminders
		if (type != 'showBugs') {
			removeAlert();
		}

		var alert_div,
			alert_contents = createEl('div'),
			link;

		alert_contents.style.setProperty(
			'background',
			(type == 'showBugs' ? '#330033' : '#777'),
			'important');

		if (type == 'showBugs') {
			for (var i = 0; i < bugs.length; i++) {
				appendChild(alert_contents, span(
					bugs[i].name,
					(bugs[i].blocked ? ALERT_ID + '-blocked' : '')
				), br());
			}

		} else {
			if (type != 'showUpdateAlert') {
				appendChild(alert_contents, createAlertLink(
					'http://purplebox.ghostery.com/?cat=82',
					TRANSLATIONS.notification_upgrade
				));
			}

			if (type == 'showWalkthroughAlert' || type == 'showUpdateAlert') {
				if (type == 'showUpdateAlert') {
					appendChild(alert_contents, span(TRANSLATIONS.notification_update));
					link = createAlertLink('', TRANSLATIONS.notification_update_link);

				} else {
					appendChild(alert_contents,
						br(),
						br(),
						span(TRANSLATIONS.notification_reminder1),
						br(),
						span(TRANSLATIONS.notification_reminder2)
					);
					link = createAlertLink('', TRANSLATIONS.notification_reminder_link);
				}

				link.addEventListener('click', function (e) {
					sendMessage(type == 'showUpdateAlert' ? 'showNewTrackers' : 'openWalkthrough');
					e.preventDefault();
				});
				appendChild(alert_contents, br(), br(), link);
			}

			link = createAlertLink(false, TRANSLATIONS.dismiss);
			link.addEventListener('click', function (e) {
				removeAlert();
				e.preventDefault();
			});
			appendChild(alert_contents, br(), br(), link);
		}

		alert_div = doc.getElementById(ALERT_ID);

		if (!alert_div) {
			alert_div = createAlert(type, alert_cfg);
		}

		alert_div.innerHTML = '';
		appendChild(alert_div, alert_contents);

		// restart the close alert bubble timer
		clearTimeout(ALERT_TIMER);
		if (alert_cfg && alert_cfg.timeout) {
			ALERT_TIMER = setTimeout(removeAlert, alert_cfg.timeout * 1000);
		}
	}

	function buildC2P(c2pFrame, c2pAppDef, html) {
		c2pFrame.addEventListener('load', function () {

			var idoc = c2pFrame.contentDocument;

			idoc.documentElement.innerHTML = html;

			if (c2pAppDef.button) {
				c2pFrame.style.width = '30px';
				c2pFrame.style.height = '19px';
				c2pFrame.style.border = '0px';
			} else {
				c2pFrame.style.width = '100%';
				c2pFrame.style.border = '1px solid #ccc';
				c2pFrame.style.height = '80px';
			}

			if (c2pAppDef.frameColor) {
				c2pFrame.style.background = c2pAppDef.frameColor;
			}

			idoc.getElementById('action-once').addEventListener('click', function (e) {
				sendMessage('processC2P', {
					action: 'once',
					app_ids: c2pAppDef.allow
				});

				e.preventDefault();
			}, true);

			if (!c2pAppDef.button) {
				idoc.getElementById('action-always').addEventListener('click', function (e) {
					sendMessage('processC2P', {
						action: 'always',
						app_ids: c2pAppDef.allow
					});

					e.preventDefault();
				}, true);
			}

		}, false);
	}

	function applyC2P(app_id, c2p_app, html) {
		c2p_app.forEach(function (c2pAppDef, idx) {

			var els = doc.querySelectorAll(c2pAppDef.ele);
			for (var i = 0, num_els = els.length; i < num_els; i++) {
				var el = els[i];

				if (c2pAppDef.attach && c2pAppDef.attach == 'parentNode') {
					if (el.parentNode) {
						if (el.parentNode.nodeName != 'BODY') {
							el = el.parentNode;
							el.textContent = '';
						}
					}
				}

				var c2pFrame = createEl('iframe');

				if (c2pAppDef.attach != 'parentNode') {
					el.textContent = '';
				}

				buildC2P(c2pFrame, c2pAppDef, html[idx]);

				appendChild(el, c2pFrame);
			}
		});
	}

	onMessage.addListener(function (request, sender, sendResponse) {
		// TODO when is sender.tab undefined?
		if (sender.tab && sender.tab.url != ce.getURL('background.html')) { // not from our background page
			return;
		}

		var valid_messages = [
				'show',
				'showUpgradeAlert',
				'showWalkthroughAlert',
				'showUpdateAlert'
			],
			name = request.name,
			msg = request.message;

		if (name == 'c2p') {
			// queue Click-to-Play data so that we process multiple Twitter buttons at once, for example
			C2P_DATA[msg.app_id] = [ msg.app_id, msg.data, msg.html ];

			if (doc.readyState == 'complete') {
				applyC2P.apply(this, C2P_DATA[msg.app_id]);
			}
		}

		// the rest are not for child frames
		//if (IS_FRAME) {
		//	return;
		//}

		if (valid_messages.indexOf(name) != -1) {
			if (!CSS_INJECTED) {
				CSS_INJECTED = true;
				injectCSS();
			}

			if (name == 'show') {
				if (!UPGRADE_ALERT_SHOWN) {
					showAlert('showBugs', msg.bugs, msg.alert_cfg);
				}
			} else {
				TRANSLATIONS = msg.translations;
				showAlert(name);
				UPGRADE_ALERT_SHOWN = true;
			}

		// TODO what's going on with surrogate code btwn chrome and safari?
		// ('surrogate' vs. 'surrogates')
		} else if (name == 'surrogate') {
			injectScript(null, msg.surrogate);

		} else if (name == 'reload') {
			doc.location.reload();
		}

		// needed for chrome.tabs.sendMessage callbacks to work (upgrade/update notifications in js/background.js)
		sendResponse({});
	});

	win.addEventListener('load', function () {
		for (var app_id in C2P_DATA) {
			applyC2P.apply(this, C2P_DATA[app_id]);
		}
		// TODO clear C2P_DATA to free memory
	}, false);

	sendMessage('pageInjected');

}());
