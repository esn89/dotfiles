/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../lib/browser.js*/

function getCategories(bp) {
	return _.map(bp.bugdb.cats, function (apps, category) {
		return {
			id: category,
			name: t("category_" + category),
			apps: new window.Apps(
				_.map(apps, function (dummy, app_id) {
					var app = bp.bugdb.apps[app_id];
					return {
						id: app_id,
						name: app.name,
						category: app.cat,
						selected: bp.conf.selected_app_ids.hasOwnProperty(app_id)
					};
				})
			)
		};
	});
}
