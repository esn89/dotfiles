/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ../lib/utils.js*/
/*jsl:import ../lib/browser.js*/
/*jsl:import ../lib/options.js*/

function updateNow(bp) {
	$('#update-now-span').text(t('library_update_in_progress'));

	bp.loadBugList(true, function (result) {
		if (!result) {
			$('#update-now-span').text(t('library_update_failed'));
			return;
		}

		updateBugsLastUpdated();

		// rebuild the tracker browser
		$('#app-list-reset-search').click();
		window.browser.categories.reset(getCategories(bp));
		window.browser.new_app_ids = prefs('newAppIds');

		$('#update-now-span').html('<span style="color:green">' + t('library_update_successful') + '</span>');
	});
}

function addSiteToWhitelist() {
	var url = this.value.replace(/^http[s]?:\/\//, ''),
		option;

	if (/^[\w\-\.\*]+(\:\d{1,5}){0,1}\/*.*/.test(url)) { // TODO better regex
		// TODO check for dups
		// TODO scroll into view
		// TODO sort
		/*
		ghostery.prefs.whitelist.sort(function(host1, host2) {
			function min(a, b) {
				return (a < b) ? a : b;
			}

			components1 = host1.split(".").reverse();
			components2 = host2.split(".").reverse();

			for (i = 0; i < min(components1.length, components2.length); i++) {
				if (components1[i] < components2[i])
					return -1;
				if (components1[i] > components2[i])
					return 1;
			}

			if (components1.length > components2.length)
				return 1;
			if (components2.length > components1.length)
				return -1;

			return 0;
		});

		for (var i = 0; i < ghostery.prefs.whitelist.length; i++) {
			sites.ensureElementIsVisible(sites.appendItem(ghostery.prefs.whitelist[i]));
		}
		*/
		option = document.createElement('option');
		option.appendChild(document.createTextNode(url));
		document.getElementById('whitelist').appendChild(option);
		$('#whitelist').change();
	}
	this.value = '';
	this.focus();
}

function initSiteWhitelist(sites) {
	var i, option, whitelist = document.getElementById('whitelist');
	// populate the list of sites
	for (i = 0; i < sites.length; i++) {
		option = document.createElement('option');
		option.appendChild(document.createTextNode(sites[i]));
		whitelist.appendChild(option);
	}
	// add site button
	document.getElementById('whitelist-add-button').addEventListener('click', function (e) {
		addSiteToWhitelist.call(document.getElementById('whitelist-add-input'));
		e.preventDefault();
	});
	// add site by pressing Enter
	$('#whitelist-add-input').keydown(function (e) {
		if (e.which == 13) { // Enter
			addSiteToWhitelist.call(this);
			e.preventDefault();
		}
	});
	// enable/disable the remove buttons
	$('#whitelist').change(function (e) {
		document.getElementById('whitelist-remove-button').disabled = !$(this).find(':selected').length;
		document.getElementById('whitelist-remove-all-button').disabled = !$(this).find('option').length;
	}).change();
	// remove button
	document.getElementById('whitelist-remove-button').addEventListener('click', function (e) {
		$('#whitelist option:selected').each(function () {
			this.parentNode.removeChild(this);
		});
		$('#whitelist').change();
		e.preventDefault();
	});
	// remove all button
	document.getElementById('whitelist-remove-all-button').addEventListener('click', function (e) {
		$('#whitelist option').each(function () {
			this.parentNode.removeChild(this);
		});
		$('#whitelist').change();
		e.preventDefault();
	});
}

function updateBugsLastUpdated() {
	var bugs_last_updated = prefs('bugs_last_updated');
	if (bugs_last_updated) {
		$('#apps-last-updated').text(t('library_updated_on',
			// TODO localize date string according to Chrome's i18n
			(new Date(+bugs_last_updated)).toDateString()
		));
	}
}

function initTabs() {
	$('.tabs li a').click(function (e) {
		var $a = $(this);

		// mark this tab active
		$a.parent('li').addClass('active');
		// and show its contents
		$(this.getAttribute('data-tab-contents-selector')).show();

		// deactivate all other tabs and hide their contents (found via the
		// anchor's data-tab-contents-selector attribute)
		$a.parent('li').siblings('li').each(function () {
			var $this = $(this);
			$this.removeClass('active');
			$($this.children('a')[0].getAttribute('data-tab-contents-selector')).hide();
		});

		e.preventDefault();
	});
}

// TODO add confirm on page close w/ unsaved changes
function save() {
	var conf = chrome.extension.getBackgroundPage().conf;

	if ($('#show-alert')[0].checked) {
		conf.show_alert = true;
		conf.alert_bubble_pos = $('#alert-bubble-pos').val();
		conf.alert_bubble_timeout = +$('#alert-bubble-timeout').val();
	} else {
		conf.show_alert = false;
	}

	conf.show_sources = $('#show_sources')[0].checked;
	conf.enable_autoupdate = $('#enable_autoupdate')[0].checked;
	conf.ghostrank = $('#ghostrank')[0].checked;

	conf.selected_app_ids = window.browser.getSelectedAppIds();

	var site_whitelist = [];
	$('#whitelist option').each(function () {
		site_whitelist.push($(this).text());
	});
	conf.site_whitelist = site_whitelist;

	conf.block_by_default = $('#block-by-default')[0].checked;
	conf.notify_library_updates = $('#notify-library-updates')[0].checked;

	window.close();
}

function initOptions() {
	var bp = chrome.extension.getBackgroundPage();

	initTabs();

	$('#ghostrank-moreinfo-link').click(function (e) {
		e.preventDefault();
		$('#ghostrank-moreinfo').slideDown(null, function () {
			$('#ghostrank-moreinfo-link').hide();
		});
	});

	$('#update-now-link').click(function (e) {
		updateNow(bp);
		e.preventDefault();
	});
	updateBugsLastUpdated();

	window.browser = new window.AppBrowser({
		el: $('#app-list-table'),
		categories: new window.Categories(getCategories(bp)),
		new_app_ids: prefs('newAppIds')
	});

	initSiteWhitelist(bp.conf.site_whitelist);

	$('#alert-bubble-help').tipTip({
		content: '<img src="images/help_alert_bubble.png" alt="">',
		maxWidth: '300px'
	});
	$('#browser-panel-help').tipTip({
		content: '<img src="images/help_panel.png" alt="">',
		maxWidth: '300px'
	});

	$('#show-alert').click(function (e) {
		$('#alert-bubble-options').toggle();
	});

	$('#cancel-button').click(function () {
		window.open('', '_self', '');
		window.close();
	}).prop('disabled', false);

	$('#save-button').click(save).prop('disabled', false);

	if (window.location.hash == '#new_trackers') {
		// scroll to tracker browser
		$("html,body").animate({
			scrollTop: $('#tabs-apps').offset().top
		}, 2000, function () {
			// filter by new trackers
			$('#app-list-filter-type').val('new').change();
		});
	}
}

// end function definitions //////////////////////////////////////////////////


document.title = t('options_page_title');

// TODO use Haml instead of HTML for templates?
require_templates([
	"_header",
	"_app_browser",
	"_ghostrank",
	"_select",
	"_footer",
	"options"
], function () {
	var _header = renderTemplate("_header", {
		ratelink_url: 'https://chrome.google.com/webstore/detail/mlomiejdfkolichcflejclcbmpeaniij',
		show_tabs: true
	});
	$('#content').append(_header);

	var options = renderTemplate("options", {
		_app_browser: getTemplate("_app_browser"),
		_ghostrank: getTemplate("_ghostrank"),
		_select: getTemplate("_select"),
		conf: chrome.extension.getBackgroundPage().conf
	});
	$('#content').append(options);

	var _footer = renderTemplate("_footer");
	$('#content').append(_footer);

	initOptions();
});
