/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

define([
	'underscore',
	'lib/utils',
	'lib/updatable'
], function (_, utils, UpdatableMixin) {

	function CompatibilityDb() {
		this.type = 'compatibility';

		function buildDb(bugs, version) {
			var	map = {};
				
			bugs.forEach(function (s) {
				map[s.aid] = s.urls;
			});

			return {
				list: map,
				version: version
			};
		}

		this.processList = function (comp) {
			var db;

			utils.log('processing comp ...');

			try {
				db = buildDb(comp.compatibility, comp.compatibilityVersion);
			} catch (e) {}

			if (!db) {
				return false;
			}

			utils.log('processed');

			this.db = db;
			utils.prefs('compatibility', comp);

			return true;
		};

		this.hasIssue = function (aid, tab_url) {
			return this.db.list.hasOwnProperty(aid) && utils.fuzzyUrlMatcher(tab_url, this.db.list[aid]);
		};

		_.extend(this, UpdatableMixin);
	}

	return new CompatibilityDb();

});
