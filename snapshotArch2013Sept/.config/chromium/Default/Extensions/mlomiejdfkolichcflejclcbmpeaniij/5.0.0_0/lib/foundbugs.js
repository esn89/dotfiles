/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

define([
	'require',
	'lib/bugdb',
	'lib/compatibility'
], function (require, bugDb, compatibility) {

	/* {
		tab_id: {
			bug_id: {
				blocked: boolean,
				sources: [
					{
						src: string,
						blocked: boolean
					},
					...
				]
			},
			...
		},
		...
	} */
	var foundBugs = {};

	function clear(tab_id) {
		delete foundBugs[tab_id];
	}

	function update(tab_id, bug_id, src, blocked, type) {
		if (!foundBugs.hasOwnProperty(tab_id)) {
			foundBugs[tab_id] = {};
		}

		if (!bug_id) {
			return;
		}

		if (!foundBugs[tab_id].hasOwnProperty(bug_id)) {
			foundBugs[tab_id][bug_id] = {
				sources: []
			};
		}
		foundBugs[tab_id][bug_id].sources.push({
			src: src,
			blocked: blocked,
			type: type.toLowerCase()
		});

		// once unblocked, unblocked henceforth
		if (foundBugs[tab_id][bug_id].blocked !== false) {
			foundBugs[tab_id][bug_id].blocked = blocked;
		}
	}

	function get(tab_id) {
		return foundBugs.hasOwnProperty(tab_id) && foundBugs[tab_id];
	}

	// convert a hash of bugs into an array of apps
	// note: sorted, tab_url are optional
	function getApps(tab_id, sorted, tab_url) {
		var apps_arr = [],
			apps_obj = {},
			bugs = get(tab_id),
			db = bugDb.db,
			id,
			aid;

		if (!bugs) {
			return bugs;
		}

		// squish all the bugs into apps first
		for (id in bugs) {
			if (!bugs.hasOwnProperty(id)) {
				continue;
			}

			aid = db.bugs[id].aid;
			if (apps_obj.hasOwnProperty(aid)) {
				// combine bug sources
				apps_obj[aid].sources = apps_obj[aid].sources.concat(bugs[id].sources);

				// once unblocked, unblocked henceforth
				if (apps_obj[aid].blocked !== false) {
					apps_obj[aid].blocked = bugs[id].blocked;
				}
			} else {
				apps_obj[aid] = {
					id: aid,
					name: db.bugs[id].name,
					cat: db.apps[aid].cat,
					blocked: bugs[id].blocked,
					sources: bugs[id].sources,
					hasCompatibilityIssue: (tab_url ? compatibility.hasIssue(aid, tab_url) : null)
				};
			}
		}

		// convert apps hash to array
		for (id in apps_obj) {
			if (apps_obj.hasOwnProperty(id)) {
				apps_arr.push(apps_obj[id]);
			}
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

	// TODO optimize
	function getAppsCount(tab_id) {
		var apps = getApps(tab_id);
		if (apps) {
			return apps.length;
		}
		return 0;
	}

	return {
		clear: clear,
		update: update,
		getBugs: get,
		getApps: getApps,
		getAppsCount: getAppsCount
	};

});
