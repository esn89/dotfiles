/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../lib/vendor/parseuri.js*/
/*jsl:import ../lib/utils.js*/
/*jsl:import ../lib/panel.js*/

require_templates([
	'panel'
], function () {
	getActiveTab(function (tab) {
		var bg = chrome.extension.getBackgroundPage(),
			apps = bg.getFoundApps(tab.id, true),
			conf = bg.conf,
			tab_url_host = parseUri(tab.url).host,
			whitelisted_url = bg.whitelisted(tab.url);

		$('#content').html(renderTemplate('panel', {
			paused: conf.paused_blocking
		}));

		initPanel(conf, apps, tab_url_host, whitelisted_url);
	});
});
