/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../js/background.js*/

var bugdb,
	loadBugList = (function () {

	function buildBugDb(bugs, version) {
		var i,
			bug,
			num_bugs,
			apps = {},
			cats = {},
			bugs_map = {},
			num_selected_patterns = 0,
			patterns_arr = [],
			priority,
			regexes = {
				high: {},
				regular: {},
				low: {}
			};

		for (i = 0, num_bugs = bugs.length; i < num_bugs; i++) {
			bug = bugs[i];

			bugs_map[bug.id] = {
				aid: bug.aid,
				name: bug.name
			};

			apps[bug.aid] = {
				name: bug.name,
				cat: bug.type
			};

			if (!cats.hasOwnProperty(bug.type)) {
				cats[bug.type] = {};
			}
			cats[bug.type][bug.aid] = true;

			patterns_arr.push(bug.pattern);

			priority = bug.priority;
			if (priority != 'high' && priority != 'low') {
				priority = 'regular';
			}
			regexes[priority][bug.id] = new RegExp(bug.pattern, 'i');

			if (window.conf.selected_app_ids.hasOwnProperty(bug.aid)) {
				num_selected_patterns++;
			}
		}

		return {
			allSelected: (num_selected_patterns == patterns_arr.length),
			noneSelected: num_selected_patterns === 0,

			apps: apps,
			cats: cats,
			bugs: bugs_map,
			regexes: regexes,
			fullRegex: new RegExp(patterns_arr.join('|'), 'i'),
			version: +version
		};
	}

	function applyBlockByDefault(new_app_ids) {
		if (!window.conf.block_by_default) {
			return;
		}

		if (!new_app_ids) {
			return;
		}

		log('applying block-by-default ...');

		_.each(new_app_ids, function (app_id) {
			window.conf.selected_app_ids[app_id] = 1;
		});
	}

	function updateNewAppIds(new_bugs, old_bugs) {
		log('updating newAppIds ...');

		var new_app_ids = _.difference(
			_.pluck(new_bugs, 'aid'),
			_.pluck(old_bugs, 'aid')
		);

		prefs('newAppIds', new_app_ids);

		return new_app_ids;
	}

	function processBugList(bugs) {
		var bugdb;

		log('processing bugs ...');

		try {
			bugdb = buildBugDb(bugs.bugs, bugs.bugsVersion);
		} catch (e) {}

		if (!bugdb) {
			return false;
		}

		log('processed');

		var old_bugs = prefs('bugs');

		// there is an older bugs object and the versions are different
		if (old_bugs && bugs.bugsVersion != old_bugs.bugsVersion) {
			applyBlockByDefault(updateNewAppIds(bugs.bugs, old_bugs.bugs));
			// TODO don't show update notifications in case of manual updates
			window.JUST_UPDATED = true;
		}

		window.bugdb = bugdb;
		prefs('bugs', bugs);

		flushChromeMemoryCache();

		return true;
	}

	// synchronous
	function localFetcher() {
		var bugsMemory = prefs('bugs');

		// nothing in storage, or it's so old it doesn't have a version
		if (!bugsMemory || !bugsMemory.bugsVersion) {
			return JSON.parse(syncGet('bugs.js'));
		}

		// on upgrades, see if bugs.js shipped w/ the extension is more recent
		if (JUST_UPGRADED) {
			var bugsDisk = JSON.parse(syncGet('bugs.js'));
			if (+bugsDisk.bugsVersion > +bugsMemory.bugsVersion) {
				return bugsDisk;
			}
		}

		return bugsMemory;
	}

	function downloadBugList(callback) {
		var UPDATE_URL = "https://www.ghostery.com/update/bugs?format=json";
		$.ajax({
			cache: false,
			dataType: 'json',
			url: UPDATE_URL,
			complete: function (xhr, status) {
				var bugs;

				if (status == 'success') {
					try {
						bugs = JSON.parse(xhr.responseText);
					} catch (e) {}
				}

				if (bugs) { // success
					callback(true, bugs);
				} else { // error
					callback(false);
				}
			}
		});
	}

	// asynchronous
	function remoteFetcher(callback) {
		var VERSION_CHECK_URL = "https://www.ghostery.com/update/version?format=json";

		// TODO this does not handle no response/404/bad JSON
		$.getJSON(VERSION_CHECK_URL, function (r) {
			if (!window.bugdb.version || +r.bugsVersion > window.bugdb.version) {
				downloadBugList(callback);
			} else {
				// already up-to-date
				callback(true);
			}
		});
	}

	// both fetchers return a bugs object to be processed
	// strategy pattern?
	return function (remote, callback) {
		// synchronous
		if (!remote) {
			log('fetching trackers from local');
			return processBugList(localFetcher());
		}

		// asynchronous
		log('fetching trackers from remote');
		remoteFetcher(function (result, bugs) {
			if (result && bugs) {
				result = processBugList(bugs);
			}

			if (result) {
				// note: only when fetching from ghostery.com
				prefs('bugs_last_updated', (new Date()).getTime());
			}

			if (callback) {
				// TODO notify the user in the nothing changed case
				// TODO if we stop updating bugs_last_updated in the nothing changed case,
				// TODO let's make sure to fix the autoupdate logic
				callback(result);
			}
		});
	};

}());
