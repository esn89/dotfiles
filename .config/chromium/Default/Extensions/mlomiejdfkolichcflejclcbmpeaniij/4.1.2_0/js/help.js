/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../lib/utils.js*/

var libraries = [
	{
		name: "jQuery",
		url: "http://jquery.com/",
		license_url: "http://jquery.org/license",
		license_text: ['/*!',
			' * jQuery JavaScript Library v1.7.2',
			' * http://jquery.com/',
			' *',
			' * Copyright 2011, John Resig',
			' * Dual licensed under the MIT or GPL Version 2 licenses.',
			' * http://jquery.org/license',
			' *',
			' * Includes Sizzle.js',
			' * http://sizzlejs.com/',
			' * Copyright 2011, The Dojo Foundation',
			' * Released under the MIT, BSD, and GPL Licenses.',
			' *',
			' * Date: Wed Mar 21 12:46:34 2012 -0700',
			' */'].join('\n')
	}, {
		name: "parseUri",
		url: "http://blog.stevenlevithan.com/archives/parseuri",
		license_url: "http://www.opensource.org/licenses/mit-license.php",
		license_text: ['// parseUri 1.2.2',
			'// (c) Steven Levithan <stevenlevithan.com>',
			'// MIT License'].join('\n')
	}, {
		name: "Apprise",
		url: "http://thrivingkings.com/apprise/",
		license_url: "http://creativecommons.org/licenses/by-sa/2.5/",
		license_text: ['// Apprise 1.5 by Daniel Raftery',
			'// http://thrivingkings.com/apprise',
			'//',
			'// Button text added by Adam Bezulski',
			'//'].join('\n')
	}, {
		name: 'Underscore.js',
		url: 'http://documentcloud.github.com/underscore/',
		license_url: "http://www.opensource.org/licenses/mit-license.php",
		license_text: ['//     Underscore.js 1.3.3',
			'//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.',
			'//     Underscore is freely distributable under the MIT license.',
			'//     Portions of Underscore are inspired or borrowed from Prototype,',
			'//     Oliver Steele\'s Functional, and John Resig\'s Micro-Templating.',
			'//     For all details and documentation:',
			'//     http://documentcloud.github.com/underscore'].join('\n')
	}, {
		name: 'Backbone.js',
		url: 'http://documentcloud.github.com/backbone/',
		license_url: "http://www.opensource.org/licenses/mit-license.php",
		license_text: ['//     Backbone.js 0.9.2',
			'',
			'//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.',
			'//     Backbone may be freely distributed under the MIT license.',
			'//     For all details and documentation:',
			'//     http://backbonejs.org'].join('\n')
	}, {
		name: "TipTip",
		url: "http://code.drewwilson.com/entry/tiptip-jquery-plugin",
		license_url: "http://www.opensource.org/licenses/mit-license.php",
		license_text: ['/*',
			' * TipTip',
			' * Copyright 2010 Drew Wilson',
			' * www.drewwilson.com',
			' * code.drewwilson.com/entry/tiptip-jquery-plugin',
			' *',
			' * Version 1.3   -   Updated: Mar. 23, 2010',
			' *',
			' * This Plug-In will create a custom tooltip to replace the default',
			' * browser tooltip. It is extremely lightweight and very smart in',
			' * that it detects the edges of the browser window and will make sure',
			' * the tooltip stays within the current window size. As a result the',
			' * tooltip will adjust itself to be displayed above, below, to the left ',
			' * or to the right depending on what is necessary to stay within the',
			' * browser window. It is completely customizable as well via CSS.',
			' *',
			' * This TipTip jQuery plug-in is dual licensed under the MIT and GPL licenses:',
			' *   http://www.opensource.org/licenses/mit-license.php',
			' *   http://www.gnu.org/licenses/gpl.html',
			' */'].join('\n')
	}
];

document.title = t('help_page_title');

require_templates([
	"_header",
	"help",
	"_library_li",
	"_footer"
], function () {
	var _header = renderTemplate("_header", {
		ratelink_url: 'https://chrome.google.com/webstore/detail/mlomiejdfkolichcflejclcbmpeaniij'
	});
	$('#content').append(_header);

	var help = renderTemplate("help", {
		libraries: libraries,
		ghostery_version: chrome.extension.getBackgroundPage().VERSION,
		_library_li: getTemplate("_library_li")
	});
	$('#content').append(help);

	var _footer = renderTemplate("_footer");
	$('#content').append(_footer);

	// licenses
	$('a.license-link').click(function (e) {
		$('body').animate({
			scrollTop: ($(this).offset().top)
		});

		this.style.display = 'none';

		// show the license text
		$('#' + this.id.replace('-link-', '-text-')).slideDown();

		e.preventDefault();
	});
});
