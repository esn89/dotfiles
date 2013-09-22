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
	'lib/utils',
	'lib/updatable'
], function (_, conf, utils, UpdatableMixin) {

	var log = utils.log;

	function BugDb() {
		this.type = 'bugs';

		function buildDb(bugs, version) {
			var i, num_bugs,
				bug,
				apps = {},
				cats = {},
				bugs_map = {},
				first_party_map = {},
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

				patterns_arr.push(bug.pattern);

				if (bug.hasOwnProperty('firstPartyUrls')) {
					first_party_map[bug.id] = bug.firstPartyUrls;
				}

				if (!cats.hasOwnProperty(bug.type)) {
					cats[bug.type] = {};
				}
				cats[bug.type][bug.aid] = true;

				priority = bug.priority;
				if (priority != 'high' && priority != 'low') {
					priority = 'regular';
				}
				regexes[priority][bug.id] = new RegExp(bug.pattern, 'i');

				if (conf.selected_app_ids.hasOwnProperty(bug.aid)) {
					num_selected_patterns++;
				}
			}

			return {
				JUST_UPDATED_WITH_NEW_TRACKERS: false,

				allSelected: (num_selected_patterns == patterns_arr.length),
				noneSelected: num_selected_patterns === 0,

				apps: apps,
				bugs: bugs_map,
				cats: cats,
				firstPartyExceptions: first_party_map,
				fullRegex: new RegExp(patterns_arr.join('|'), 'i'),
				regexes: regexes,
				version: version
			};
		}

		function updateNewAppIds(new_bugs, old_bugs) {
			log('updating newAppIds ...');

			var new_app_ids = _.difference(
				_.pluck(new_bugs, 'aid'),
				_.pluck(old_bugs, 'aid')
			);

			utils.prefs('newAppIds', new_app_ids);

			return new_app_ids;
		}

		this.processList = function (bugs) {
			var db;

			log('processing bugs ...');

			try {
				db = buildDb(bugs.bugs, bugs.bugsVersion);
			} catch (e) {}

			if (!db) {
				return false;
			}

			log('processed');

			var old_bugs = utils.prefs('bugs');

			// there is an older bugs object and the versions are different
			// TODO should be doing > instead of != once we convert all versions to timestamps
			// TODO keeping this logic until a post 5.0 update to work
			// around users with a hash-based version in memory (shouldn't
			// have any more hash-based versions after 5.0)
			if (old_bugs && bugs.bugsVersion != old_bugs.bugsVersion) {
				var new_app_ids = updateNewAppIds(bugs.bugs, old_bugs.bugs);

				if (conf.block_by_default) {
					log('applying block-by-default ...');

					_.each(new_app_ids, function (app_id) {
						conf.selected_app_ids[app_id] = 1;
					});
				}

				if (new_app_ids.length) {
					db.JUST_UPDATED_WITH_NEW_TRACKERS = true;
				}
			}

			this.db = db;
			utils.prefs('bugs', bugs);

			utils.flushChromeMemoryCache();

			return true;
		};

		_.extend(this, UpdatableMixin);
	}

	return new BugDb();

});
