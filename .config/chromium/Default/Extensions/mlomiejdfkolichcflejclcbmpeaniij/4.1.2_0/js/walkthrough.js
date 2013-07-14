/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../lib/vendor/apprise/apprise-1.5.full.js*/
/*jsl:import ../lib/utils.js*/
/*jsl:import ../lib/browser.js*/
/*jsl:import ../lib/options.js*/

var browser;

function saveWalkthrough() {
	var conf = chrome.extension.getBackgroundPage().conf;

	conf.show_alert = $('#show-alert')[0].checked;
	conf.enable_autoupdate = $('#enable-autoupdate')[0].checked;
	conf.ghostrank = $('#ghostrank')[0].checked;
	conf.selected_app_ids = window.browser.getSelectedAppIds();
}

function initNavigation() {
	var slides = $('#slider').children(),
		current = 0;

	function onNavigate() {
		$('#walkthrough-progress').children()
			.removeClass('active')
			.eq(current).addClass('active');

		$('#arrow-prev').toggle(current > 0);
		$('#arrow-next, #skip-button').toggle(current < slides.length - 1);

		saveWalkthrough();

		if (current + 1 == slides.length) {
			prefs('walkthroughFinished', true);
		}
	}

	function next() {
		if (current + 1 >= slides.length) {
			return;
		}

		$(slides[current]).hide();
		$(slides[current + 1]).show();

		current++;

		onNavigate();
	}

	function prev() {
		if (!current) {
			return;
		}

		$(slides[current]).hide();
		$(slides[current - 1]).show();

		current--;

		onNavigate();
	}

	// clickable arrows
	$('#arrow-prev').click(function (e) {
		prev();
		e.preventDefault();
	}).hide();

	$('#arrow-next').click(function (e) {
		next();
		e.preventDefault();
	});

	// left/right keyboard controls
	$(window).keyup(function (e) {
		// don't navigate when using the tracker browser's name filter input
		if (e.target == $('#app-list-filter-name')[0]) {
			return;
		}
		if (e.keyCode == 37) {
			prev();
		} else if (e.keyCode == 39) {
			next();
		}
	});
}

function initWalkthrough() {
	var bp = chrome.extension.getBackgroundPage();

	document.title = t('walkthrough_page_title');

	window.browser = new window.AppBrowser({
		el: $('#app-list-table'),
		categories: new window.Categories(getCategories(bp)),
		new_app_ids: prefs('newAppIds')
	});

	$('#version-text').text(bp.VERSION);

	$('#skip-button').click(function (e) {
		e.preventDefault();

		apprise(t('walkthrough_skip_confirmation'), {
			confirm: true,
			textOk: t('button_ok'),
			textCancel: t('button_cancel')
		}, function (r) {
			if (r) {
				prefs('walkthroughAborted', true);
				window.open('', '_self', ''); // window.close() workaround
				window.close();
			}
		});
	});

	$('#ghostrank-moreinfo-link').click(function (e) {
		e.preventDefault();
		$('#ghostrank-moreinfo').slideDown(null, function () {
			$('#ghostrank-moreinfo-link').hide();
		});
	});

	initNavigation();
}

// end function definitions //////////////////////////////////////////////////


require_templates([
	"walkthrough",
	"_app_browser",
	"_ghostrank",
	"_select",
	"_footer"
], function () {
	var walkthrough = renderTemplate('walkthrough', {
		_app_browser: getTemplate("_app_browser"),
		_ghostrank: getTemplate("_ghostrank"),
		_select: getTemplate("_select"),
		conf: chrome.extension.getBackgroundPage().conf
	});
	$('#content').append(walkthrough);

	var _footer = getTemplate("_footer");
	$('#content').append(_footer);

	initWalkthrough();
});
