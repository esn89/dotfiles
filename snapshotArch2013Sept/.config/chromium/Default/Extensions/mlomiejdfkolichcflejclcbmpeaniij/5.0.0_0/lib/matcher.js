/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

define([
	'lib/bugdb',
	'lib/utils'
], function (bugDb, utils) {

	// TODO THIS HAS TO BE SUPER FAST
	function isBug(src, tab_url) {
		var i,
			id,
			priorities = ['high', 'regular', 'low'],
			regexes,
			db = bugDb.db,
			q;

		if (!db.fullRegex.test(src)) {
			return false;
		}

		// strip out the querystring, including the ?, to reduce false positives
		q = src.indexOf('?');
		if (q >= 0) {
			src = src.slice(0, q);
		}

		for (i = 0; i < priorities.length; i++) {
			regexes = db.regexes[priorities[i]];

			for (id in regexes) {
				// note: no hasOwnProperty check since our code is sandboxed

				// TODO can still produce false positives (when something that
				// TODO matches a tracker is in the path somewhere, for example)
				if (regexes[id].test(src)) {
					if (tab_url &&
						db.firstPartyExceptions[id] &&
						utils.fuzzyUrlMatcher(tab_url, db.firstPartyExceptions[id])) {
						return false;
					}

					return id;
				}
			}
		}

		return false;
	}

	return {
		isBug: isBug
	};

});
