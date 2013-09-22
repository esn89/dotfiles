/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

require([
	'jquery',
	'lib/panel'
], function ($, Panel) {

	var bg = chrome.extension.getBackgroundPage();

	bg.dispatcher.once('panelData', function (message) {
		$('#content').html(Panel.render().el);

		// TODO awkward ... need to initialize language before anything else
		Panel.model.set('language', message.language);
		Panel.model.set(message);
	});

	bg.dispatcher.trigger('panelLoaded');

});
