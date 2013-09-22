/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

define([
	'underscore',
	'parseuri'
], function (_, parseUri) {

	var utils = {};

	utils.syncGet = function (url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		return xhr.responseText;
	};

	utils.VERSION = JSON.parse(utils.syncGet(chrome.extension.getURL('manifest.json'))).version;

	utils.log = function () {
		if (!localStorage.debug) {
			return;
		}
		// convert arguments object to array
		var args = [].slice.call(arguments, 0);
		if (args[0]) {
			args[0] = (new Date()).toTimeString() + '\t\t' + args[0];
		}
		console.log.apply(console, args);
	};

	utils.prefs = function (key, value) {
		if (typeof value != 'undefined') {
			localStorage.setItem(key, JSON.stringify(value));
		} else {
			value = localStorage.getItem(key);
			return value && JSON.parse(value);
		}
	};

	utils.createLink = function (href, text, class_name, title) {
		var link = document.createElement('a');
		link.href = href;
		link.target = '_blank';
		if (class_name) {
			link.className = class_name;
		}
		if (title) {
			link.title = title;
		}
		link.appendChild(document.createTextNode(text));
		return link;
	};

	utils.createCheckbox = function (id, checked, class_name) {
		var check = document.createElement('input');
		check.type = 'checkbox';
		if (checked !== undefined) {
			check.checked = !!checked;
		}
		if (class_name) {
			check.className = class_name;
		}
		check.id = id;
		return check;
	};

	utils.getActiveTab = function (callback) {
		chrome.tabs.query({
			active: true,
			windowId: chrome.windows.WINDOW_ID_CURRENT
		}, function (tabs) {
			callback(tabs[0]);
		});
	};

	// Flush Chrome's in-memory cache.
	// GHOST-248: Debounced to run no more often than once every 35 seconds
	// to avoid the "slow extension" warning.
	// TODO should run once at start of period, and once at end?
	// TODO use chrome.webRequest.MAX_HANDLER_BEHAVIOR_CHANGED_CALLS_PER_10_MINUTES (can default to 20 if undefined)
	utils.flushChromeMemoryCache = _.debounce(function () {
		utils.log("FLUSHING CHROME'S IN-MEMORY CACHE");
		chrome.webRequest.handlerBehaviorChanged();
	}, 1000 * 35, true);

	utils.fuzzyUrlMatcher = function (url, urls) {
		// TODO belongs in tabInfo
		var parsed = parseUri(url),
			tab_host = parsed.host,
			tab_path = parsed.path;

		if (tab_host.indexOf('www.') === 0) {
			tab_host = tab_host.slice(4);
		}

		for (var i = 0; i < urls.length; i++) {
			parsed = parseUri(urls[i]);
			var host = parsed.host,
				path = parsed.path;

			if (host != tab_host) {
				continue;
			}

			if (!path) {
				utils.log('[fuzzyUrlMatcher] host (%s) match', host);
				return true;
			}

			if (path.slice(-1) == '*') {
				if (tab_path.indexOf(path.slice(0, -1)) === 0) {
					utils.log('[fuzzyUrlMatcher] host (%s) and path (%s) fuzzy match', host, path);
					return true;
				}

			} else {
				if (path == tab_path) {
					utils.log('[fuzzyUrlMatcher] host (%s) and path (%s) match', host, path);
					return true;
				}
			}
		}
	};

	return utils;

});
