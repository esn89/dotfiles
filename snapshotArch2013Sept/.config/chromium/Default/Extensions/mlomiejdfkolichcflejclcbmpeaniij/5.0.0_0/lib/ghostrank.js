/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

define([
	'underscore',
	'lib/conf',
	'lib/bugdb',
	'lib/utils',
	'parseuri'
], function (_, conf, bugDb, utils, parseUri) {

	// censusCache[Y-m-d][location.host + location.pathname][bug_id] = 1
	// note: censusCache is not persisted
	var censusCache = {},
		preCensusCache = {};

	function getToday() {
		var now = new Date();
		return now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
	}

	function cleanCaches() {
		var today = getToday();

		[censusCache, preCensusCache].forEach(function (cache, i) {
			for (var id in cache) {
				if (cache.hasOwnProperty(id)) {
					if (id != today) {
						utils.log("Cleaned up %s.",
							(i == 1 ? 'preCensusCache': 'censusCache'));
						delete cache[id];
					}
				}
			}
		});
	}

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

		if (!preCensusCache.hasOwnProperty(today) ||
			!preCensusCache[today].hasOwnProperty(host_with_pathname)) {
			return;
		}

		// move the bug IDs from preCensusCache to censusCache

		_.keys(preCensusCache[today][host_with_pathname]).forEach(function (bug_id) {
			setCache(censusCache, today, bug_id, host_with_pathname);
		});

		delete preCensusCache[today][host_with_pathname];
	}

	function recordStats(tab_url, bug_url, bug_id, block, latency) {
		var today = getToday(),
			db = bugDb.db,
			bug = db.bugs[bug_id],
			parsedURL = parseUri(tab_url),
			host_with_pathname = parsedURL.host + (parsedURL.port ? ':' + parsedURL.port : '') + parsedURL.path,
			census_url,
			xhr;

		if (!isValidUrl(parsedURL)) {
			return;
		}

		// record only if current [host_with_pathname]:[web bug] has not already been submitted for today
		if (censusCache.hasOwnProperty(today) &&
			censusCache[today].hasOwnProperty(host_with_pathname) &&
			censusCache[today][host_with_pathname].hasOwnProperty(bug_id)) {
			return;
		}

		census_url = 'https://l.ghostery.com/api/census' +
			'?bid=' + encodeURIComponent(bug.aid) + // company app ID
			'&apid=' + encodeURIComponent(bug_id) + // app pattern ID
			'&d=' + encodeURIComponent(host_with_pathname) +
			'&src=' + encodeURIComponent(bug_url) +
			// bl: should this bug have gotten blocked after taking all settings into account?
			// TODO verify
			'&bl=' + (block ? 'true' : 'false') +
			// blm: blocking mode: 1 means "block all", 0 means "block selected", -1 means "off"
			'&blm=' + (db.noneSelected ? '-1' : (db.allSelected ? '1' : '0')) +
			// bs: is the bug selected for blocking (regardless of whether we are blocking)?
			'&bs=' + (conf.selected_app_ids.hasOwnProperty(bug.aid) ? 'true' : 'false') +
			// nl: network latency
			'&nl=' + latency +
			// bv: bug library version
			'&bv=' + encodeURIComponent(db.version) +
			// cv: caching scheme version
			'&cv=2' +
			'&ua=chrome' +
			'&v=' + encodeURIComponent(utils.VERSION);

		utils.log('XHR to ' + census_url);

		xhr = new XMLHttpRequest();
		xhr.open("GET", census_url, true);
		xhr.send();

		setCache(preCensusCache, today, bug_id, host_with_pathname);
	}

	// records page domain, latency, # of adSpots, UA
	function recordPageInfo(domain, page_latency, ad_spots) {
		if (!conf.ghostrank) {
			return;
		}

		var xhr,
			page_info_url = 'https://l.ghostery.com/api/page/' +
				'?d=' + encodeURIComponent(domain) +
				'&l=' + page_latency +
				'&s=' + ad_spots +
				'&ua=chrome';

		utils.log('XHR to ' + page_info_url);

		xhr = new XMLHttpRequest();
		xhr.open("GET", page_info_url, true);
		xhr.send();
	}

	function isValidUrl(parsedURL) {
		if (parsedURL.protocol.indexOf('http') === 0 && parsedURL.host.indexOf('.') !== -1 && /[A-Za-z]/.test(parsedURL.host)) {
			return true;
		} else {
			utils.log('GR data not sent, invalid URL');
			return false;
		}
	}

	// every thirty minutes
	setInterval(cleanCaches, 1800000);

	return {
		onNavigate: onNavigate,
		record: recordStats,
		recordPage: recordPageInfo,
		isValidUrl: isValidUrl
	};

});
