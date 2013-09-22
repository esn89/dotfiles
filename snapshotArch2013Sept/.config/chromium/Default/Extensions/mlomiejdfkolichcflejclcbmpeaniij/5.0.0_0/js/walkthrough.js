/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2013 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

// TODO move stuff that's not opera/chrome/safari specific to lib/walkthrough.js

require([
	'jquery',
	'underscore',
	'backbone',
	'apprise',
	'lib/browser',
	'lib/i18n',
	'lib/utils',
	'tpl/walkthrough'
], function ($, _, Backbone, apprise, browser, i18n, utils, walkthrough_tpl) {

	var bro,
		t = i18n.t;

	function sendMessage(name, message) {
		var bg = chrome.extension.getBackgroundPage();
		bg.dispatcher.trigger(name, message);
	}

	function saveWalkthrough() {
		var conf = {};

		conf.show_alert = $('#show-alert')[0].checked;
		conf.enable_autoupdate = $('#enable-autoupdate')[0].checked;
		conf.ghostrank = $('#ghostrank')[0].checked;
		conf.selected_app_ids = bro.getSelectedAppIds();
		conf.block_by_default = $('#block-by-default')[0].checked;

		sendMessage('walkthroughSave', conf);
	}

	function initNavigation() {
		var slides = $('#slider').children(),
			current = 0,
			headerTitles = [
				t('walkthrough_intro_header'),
				t('walkthrough_sharing_header'),
				t('walkthrough_notification_header'),
				t('walkthrough_blocking_header'),
				t('walkthrough_finished1')
			];

		$('#header-title').text(headerTitles[current]);

		function onNavigate() {
			$('#walkthrough-progress').children()
				.removeClass('active')
				.eq(current).addClass('active');

			$('#arrow-prev').toggle(current > 0);
			$('#arrow-next, #skip-button').toggle(current < slides.length - 1);

			saveWalkthrough();

			if (current + 1 == slides.length) {
				sendMessage('walkthroughFinished');
			}
		}

		function next() {
			if (current + 1 >= slides.length) {
				return;
			}

			$(slides[current]).hide();
			$(slides[current + 1]).show();
			$('#header-title').text(headerTitles[current + 1]);

			current++;

			onNavigate();
		}

		function prev() {
			if (!current) {
				return;
			}

			$(slides[current]).hide();
			$(slides[current - 1]).show();
			$('#header-title').text(headerTitles[current - 1]);

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

	function loadWalkthrough(bp) {
		i18n.init(bp.conf.language);

		document.title = t('walkthrough_page_title');

		$('#content').html(
			walkthrough_tpl({
				conf: bp.conf
			})
		);

		browser.init(bp.conf.language);

		bro = new browser.AppBrowser({
			el: $('#app-list-table'),
			categories: new browser.Categories(
				browser.getCategories(bp.db, bp.conf.selected_app_ids)
			),
			new_app_ids: utils.prefs('newAppIds')
		});

		$('#version-text').text(utils.VERSION);

		$('#skip-button').click(function (e) {
			e.preventDefault();

			apprise(t('walkthrough_skip_confirmation'), {
				confirm: true,
				textOk: t('button_ok'),
				textCancel: t('button_cancel')
			}, function (r) {
				if (r) {
					sendMessage('walkthroughAborted');
					window.open('', '_self', ''); // window.close() workaround
					window.close();
				}
			});
		});

		$('#ghostrank-moreinfo-link').click(function (e) {
			e.preventDefault();
			$('#ghostrank-moreinfo').slideDown(null, function () {
				$('#ghostrank-moreinfo-link').parent().hide();
			});
		});

		initNavigation();
	}

	// end function definitions //////////////////////////////////////////////////

	var bg = chrome.extension.getBackgroundPage();

	bg.dispatcher.once('optionsData', function (message) {
		// TODO should this be inside ondomready or whatever?
		// TODO review order of things (to speed up page rendering)
		loadWalkthrough(message);
	});

	sendMessage('optionsLoaded');

});
