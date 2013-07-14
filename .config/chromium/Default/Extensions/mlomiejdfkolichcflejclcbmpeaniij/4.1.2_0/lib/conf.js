/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../js/background.js*/

// TODO require.js modularize
// TODO unit tests
// TODO generalize into a helper/mixin (?) that equips objects with getters/setters

// Returns a conf object that acts as a write-through cache.
//
// All conf properties are backed by getters and setters,
// which lets us transparently persistent to localStorage on update.
//
// Conf properties that are not arrays or objects contain their default value
// in the defaults object, and are persisted in localStorage (without JSON
// stringifying/parsing) under the same name.
//
// Conf properties that are arrays or objects (used as hashes) require an
// object in the defaults object containing the following functions:
//
// 1. init(): Called once on property initialization. Responsible for reading
// from localStorage if there is something there.
//
// 2. save(value): Called every time the property gets updated. Responsible for
// saving the value to localStorage and calling whatever else needs to happen.
function loadConf() {
	var ret = {},
		_values = {},
		defaults = {
			alert_bubble_pos: 'tr',
			alert_bubble_timeout: 15,
			block_by_default: false,
			enable_autoupdate: false,
			ghostrank: false,
			notify_library_updates: false,
			show_alert: true,
			show_sources: true,

			selected_app_ids: {
				init: function () {
					// legacy variable name: it actually stores app IDs
					return prefs('selected_bug_ids') || {};
				},
				save: function (v) {
					prefs('selected_bug_ids', v);

					var db = window.bugdb;
					if (db) {
						var num_selected = _.size(v);
						db.noneSelected = (num_selected === 0);
						db.allSelected = (num_selected && num_selected == _.size(db.apps));
					}

					// note: this calls flushChromeMemoryCache
					ret.paused_blocking = false;
				}
			},

			site_whitelist: {
				init: function () {
					return prefs('site_whitelist') || [];
				},
				save: function (v) {
					prefs('site_whitelist', v);

					updateButton();
					flushChromeMemoryCache();
				}
			},

			// note: not persisted
			// TODO right now object/array change monitoring is tied to customizing loading and saving, but it shouldn't be
			paused_blocking: {
				init: function () {
					return false;
				},
				save: function (v) {
					updateButton();
					flushChromeMemoryCache();
				}
			}
		};

	// migrate legacy storage (used by <= 4.0.0)
	if (localStorage.alert_bubble_cfg) {
		// convert 1/0 to booleans
		_.each(defaults, function (sval, sname) {
			if (_.isObject(sval)) {
				// only need to migrate simple preferences
				return;
			}
			var val = localStorage[sname];
			if (val === "1") {
				prefs(sname, true);
			} else if (val === "0") {
				prefs(sname, false);
			}
		});

		var val = localStorage.alert_bubble_cfg;
		prefs('alert_bubble_pos', val.slice(0, 2));
		prefs('alert_bubble_timeout', +val.slice(2));
		delete localStorage.alert_bubble_cfg;
	}

	_.each(defaults, function (sval, sname) {
		var initial;

		if (_.isObject(sval)) { // complex preference
			// initial value
			initial = sval.init();
			// TODO do we need to clone here (and clone twice)?
			_values[sname] = {
				current: _.clone(initial),
				old: _.clone(initial)
			};

			// waits 200 ms to check if we need to trigger the setter
			// throttled to run only once at the end of frequent updates/fetches
			// TODO Race condition when something that executes right
			// TODO afterwards depends on changes made in the setter. Shorten
			// TODO the interval as a workaround?
			var check_for_changes = _.debounce(function () {
				var v = _values[sname];

				//log('checking old vs. new for %s ...', sname);

				if (!_.isEqual(v.current, v.old)) {
					//log('change detected for %s', sname);

					// trigger the setter
					// TODO do we need to clone here?
					ret[sname] = _.clone(v.current);
				}
			}, 200);

			// getter and setter
			Object.defineProperty(ret, sname, {
				get: function () {
					//log('getter for %s', sname);

					// Can't have a catchall setter on all properties, but we
					// need to detect changes in the array/object made through
					// subscript access (o[i] = true), array methods,
					// and deletes (for objects).

					// TODO replace w/ proxies when they land in V8?
					check_for_changes();

					return _values[sname].current;
				},
				set: function (v) {
					//log('setter for %s', sname);

					// TODO do we need to clone here?
					_values[sname].current = v;
					_values[sname].old = _.clone(v);
					sval.save(v);
				}
			});

		} else { // simple preference
			// initial value
			initial = prefs(sname);
			// null and undefined both mean unset, so use the default
			if (initial == null) {
				initial = sval;
			}
			_values[sname] = initial;

			// getter and setter
			Object.defineProperty(ret, sname, {
				get: function () {
					return _values[sname];
				},
				set: function (v) {
					prefs(sname, v);
					_values[sname] = v;
				}
			});
		}
	});

	// support stringifying (so that at least conf values can be used via
	// message passing in Safari (where there is no direct access to the bg
	// page))
	ret.toJSON = function () {
		return _.reduce(_values, function (memo, val, key) {
			// complex preferences contain their value in val.current
			memo[key] = _.isObject(val) ? val.current : val;
			return memo;
		}, {});
	};

	return ret;
}
