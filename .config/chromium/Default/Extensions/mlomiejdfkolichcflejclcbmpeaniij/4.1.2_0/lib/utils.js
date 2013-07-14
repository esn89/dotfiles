/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

// TODO move to js/

function log() {
	if (!localStorage.debug) {
		return;
	}
	// convert arguments object to array
	var args = [].slice.call(arguments, 0);
	if (args[0]) {
		args[0] = (new Date()).toTimeString() + '\t\t' + args[0];
	}
	console.log.apply(console, args);
}

function prefs(key, value) {
	if (typeof value != 'undefined') {
		localStorage.setItem(key, JSON.stringify(value));
	} else {
		value = localStorage.getItem(key);
		return value && JSON.parse(value);
	}
}

function syncGet(url) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.send(null);
	return xhr.responseText;
}

// returns the template as a reusable function
function getTemplate(name) {
	return window.__templates[name];
}

// returns the template's contents in a string
function renderTemplate(name, config) {
	config = config || {};
	return getTemplate(name)(config);
}

// TODO placeholder for require.js
function appendScript(url, callback) {
	var head = document.getElementsByTagName('head')[0] || document.documentElement,
		loaded,
		script = document.createElement('script');

	function onload() {
		// clean up
		script.onload = script.onreadystatechange = null;
		head.removeChild(script);

		callback();
	}

	// cache busting
	url += (url.indexOf('?') >= 0 ? '&' : '?') + 'r=' + (new Date()).getTime();

	log("appendScript: %s", url);

	script.async = true;
	script.src = url;
	script.charset = "utf-8";

	if (callback) {
		script.onreadystatechange = function () {
			if (!loaded && (this.readyState == 'loaded' || this.readyState == 'complete')) {
				loaded = true;
				onload();
			}
		};
		script.onload = onload;
	}

	// IE6 bug workaround: see jQuery bugs 2709 and 4378
	// and http://www.stevesouders.com/blog/2010/05/11/appendchild-vs-insertbefore/
	head.insertBefore(script, head.firstChild);
}

// TODO placeholder for require.js
function require(scripts, callback) {
	var num_loaded = 0;
	scripts.forEach(function (script) {
		appendScript(script, function () {
			num_loaded++;
			if (num_loaded == scripts.length) {
				if (callback) {
					callback();
				}
			}
		});
	});
}

function require_templates(templates, callback) {
	require(templates.map(function (t) {
		return 'templates/precompiled/' + t + '.js';
	}), callback);
}

function createLink(href, text, class_name, title) {
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
}

function createCheckbox(id, checked, class_name) {
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
}

function getActiveTab(callback) {
	chrome.tabs.query({
		active: true,
		windowId: chrome.windows.WINDOW_ID_CURRENT
	}, function (tabs) {
		callback(tabs[0]);
	});
}

// shortcut to Chrome's translation function
function t() {
	return chrome.i18n.getMessage.apply(chrome.i18n, arguments) || arguments[0];
}

function t_blocking_summary(num_selected, num_total, small) {
	var text = '';

	if (num_selected === 0) {
		text = t(small ? 'blocking_none' : 'blocking_no');
	} else if (num_selected < num_total) {
		text = t('blocking_some', [num_selected, num_total]);
	} else {
		text = t('blocking_all');
	}

	return t('blocking_summary' + (small ? '_small' : ''), text);
}

// use Mustache.js-style template tags
//_.templateSettings = {
//	evaluate:		/{{(.+?)}}/g,
//	interpolate:	/{{=(.+?)}}/g,
//	escape:			/{{-(.+?)}}/g
//};
