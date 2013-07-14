/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

(function () {

	// TODO slim down as much as possible

	var ALERT_ID = 'ghostery-alert-' + Math.ceil(Math.random() * 10000),
		ALERT_TIMER,
		CSS_INJECTED = false,
		UPGRADE_ALERT_SHOWN = false,
		d = document,
		ce = chrome.extension;

	function createEl(type) {
		return d.createElement(type);
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

	function injectCSS() {
		var style = createEl('style'),
			imp = ' !important;';

		style.innerHTML = '#' + ALERT_ID + '{' +
			'border:solid 2px #fff' + imp +
			// TODO SVN blame this one
			'box-sizing:content-box' + imp +
			'color:#fff' + imp +
			'display:block' + imp +
			'font:13px Arial,Helvetica' + imp +
			'height:auto' + imp +
			'margin:0' + imp +
			'opacity:0.9' + imp +
			'padding:7px 10px' + imp +
			'position:fixed' + imp +
			'text-align:left' + imp +
			'text-shadow:none' + imp +
			'text-transform:none' + imp +
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

			'@media print{#' + ALERT_ID + '{display:none' + imp + '}}';

		appendChild(d.getElementsByTagName('head')[0], style);
	}

	function removeAlert() {
		var el = d.getElementById(ALERT_ID);
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
		appendChild(link, d.createTextNode(text));
		return link;
	}

	function span(text, class_name) {
		var s = createEl('span');
		if (class_name) {
			s.className = class_name;
		}
		appendChild(s, d.createTextNode(text));
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

		if (d.getElementsByTagName('body')[0]) {
			appendChild(d.body, alert_div);
		} else {
			appendChild(d.getElementsByTagName('html')[0], alert_div);
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
			i18n = chrome.i18n,
			link;

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
					i18n.getMessage('notification_upgrade')
				));
			}

			if (type == 'showWalkthroughAlert' || type == 'showUpdateAlert') {
				if (type == 'showUpdateAlert') {
					appendChild(alert_contents, span(i18n.getMessage('notification_update')));
					link = createAlertLink('', i18n.getMessage('notification_update_link'));

				} else {
					appendChild(alert_contents,
						br(),
						br(),
						span(i18n.getMessage('notification_reminder1')),
						br(),
						span(i18n.getMessage('notification_reminder2'))
					);
					link = createAlertLink('', i18n.getMessage('notification_reminder_link'));
				}

				link.addEventListener('click', function (e) {
					ce.sendRequest({
						msg: (type == 'showUpdateAlert' ? 'showNewTrackers' : 'openWalkthrough')
					});
					e.preventDefault();
				});
				appendChild(alert_contents, br(), br(), link);
			}

			link = createAlertLink(false, i18n.getMessage('dismiss'));
			link.addEventListener('click', function (e) {
				removeAlert();
				e.preventDefault();
			});
			appendChild(alert_contents, br(), br(), link);
		}

		alert_div = d.getElementById(ALERT_ID);

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

	ce.onRequest.addListener(function (request, sender, sendResponse) {
		if (sender.tab && sender.tab.url != ce.getURL('background.html')) { // not from our background page
			return;
		}

		var valid_messages = [
			'show',
			'showUpgradeAlert',
			'showWalkthroughAlert',
			'showUpdateAlert'
		];

		if (valid_messages.indexOf(request.msg) != -1) {
			if (!CSS_INJECTED) {
				CSS_INJECTED = true;
				injectCSS();
			}

			if (request.msg == 'show') {
				if (!UPGRADE_ALERT_SHOWN) {
					showAlert('showBugs', request.bugs, request.alert_cfg);
				}
			} else {
				showAlert(request.msg);
				UPGRADE_ALERT_SHOWN = true;
			}

		} else if (request.msg == 'surrogate') {
			var script = createEl('script');
			appendChild(script, d.createTextNode(request.surrogate));
			d.documentElement.insertBefore(script, d.documentElement.firstChild);
		}

		sendResponse({});
	});

	ce.sendRequest({
		msg: 'pageInjected'
	});

}());
