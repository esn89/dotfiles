/*!
 * Ghostery for Chrome
 * http://www.ghostery.com/
 *
 * Copyright 2012 EVIDON, Inc. All rights reserved.
 * See ghostery_eula.txt for license.
 */

/*jsl:import ./utils.js*/

function openTab(url) {
	chrome.tabs.create({ url: url });
	window.close();
}

function updateWhitelistSiteText(host, whitelisted_url) {
	var text = t(
		(whitelisted_url ? 'panel_unexempt_url' : 'panel_exempt_url'),
		(whitelisted_url ? whitelisted_url : host)
	);
	$('#whitelist-site-link').text(text).attr('title', text);
}

function initBlockingOptions(tab_url_host, whitelisted_url) {
	updateWhitelistSiteText(tab_url_host, whitelisted_url);

	$('#edit-blocking-link').click(function (e) {
		$('#edit-blocking-link, #apps-div span.app-link-span, #apps-div div.app-sources-div').hide();
		$('#apps-div span.app-name-span').removeClass('bold').parent('label').each(function () {
			this.setAttribute('for', this.id.replace('for-', ''));
		});
		$('#apps-div input.app-checkbox, #whitelist-site-link').show();
		e.preventDefault();
	});

	$('#whitelist-site-link').click(function (e) {
		var bg = chrome.extension.getBackgroundPage();

		if (whitelisted_url) {
			bg.conf.site_whitelist.splice(bg.conf.site_whitelist.indexOf(whitelisted_url), 1);
		} else if (tab_url_host) {
			bg.conf.site_whitelist.push(tab_url_host);
		}

		whitelisted_url = (whitelisted_url ? false : tab_url_host);
		updateWhitelistSiteText(tab_url_host, whitelisted_url);

		e.preventDefault();
	});
}

function initPanel(conf, apps, tab_url_host, whitelisted_url) {
	displayApps(conf, apps);

	if (apps) {
		initBlockingOptions(tab_url_host, whitelisted_url);
		$('#blocking-options-div').show();
	}

	$('#pause-blocking').click(function (e) {
		var img = $(this).find('img')[0];

		if (conf.paused_blocking) {
			conf.paused_blocking = false;
			img.src = '/images/panel/pause.png';
			img.title = t('panel_pause_button');
		} else {
			conf.paused_blocking = true;
			img.src = '/images/panel/play.png';
			img.title = t('panel_resume_button');
		}

		e.preventDefault();
	});

	$('#options').click(function (e) {
		openTab(chrome.extension.getURL('options.html'));
		e.preventDefault();
	});
	
	$('#help').click(function (e) {
		openTab(chrome.extension.getURL('help.html'));
		e.preventDefault();
	});

	//setTimeout(function () {
	//	if (document.activeElement) {
	//		document.activeElement.blur();
	//	}
	//}, 200);
}

function toggleAppBlocking() {
	var conf = chrome.extension.getBackgroundPage().conf;

	if (this.checked) {
		conf.selected_app_ids[this.id.replace('app-', '')] = 1;
	} else {
		delete conf.selected_app_ids[this.id.replace('app-', '')];
	}
}

function displayApps(conf, apps) {
	var i, j,
		num_apps = (apps ? apps.length : 0),
		apps_div = document.getElementById('apps-div'),
		app_list_div,
		header = document.createElement('div'),
		header_icon = document.createElement('img');

	header_icon.src = chrome.extension.getURL('images/panel/ghosty_top.png');
	header.appendChild(header_icon);
	header.id = 'header';

	if (num_apps === 0) {
		header.appendChild(document.createTextNode((apps ? t('panel_nothing_found') : t('panel_not_scanned'))));
		apps_div.appendChild(header);
		return;
	}

	for (i = 0; i < num_apps; i++) {
		if (i === 0) {
			header.appendChild(document.createTextNode(t('panel_found1')));
			header.appendChild(document.createElement('br'));
			header.appendChild(document.createTextNode(t('panel_found2')));
			header.className = 'border-bottom-gray';
			apps_div.appendChild(header);
			app_list_div = document.createElement('div');
			app_list_div.id = 'app-list-div';
		}
		var app_div = document.createElement('div');
		app_div.className = 'app-div';

		var app_name_div = document.createElement('div');
		app_name_div.className = 'ellipsis';

		var check = createCheckbox('app-' + apps[i].id, conf.selected_app_ids.hasOwnProperty(apps[i].id), 'app-checkbox');
		check.addEventListener('click', toggleAppBlocking);
		app_name_div.appendChild(check);

		var app_link_span = document.createElement('span');
		var classes = ['app-link-span', 'float-right'];
		if (conf.show_sources) {
			classes.push('bold');
		}
		app_link_span.className = classes.join(' ');
		// TODO i18n "more info"
		app_link_span.appendChild(createLink('http://www.ghostery.com/apps/' + encodeURIComponent(apps[i].name.replace(/\s+/g, '_').toLowerCase()), 'more info'));
		app_name_div.appendChild(app_link_span);

		var app_name_span = document.createElement('span'),
			app_name_label = document.createElement('label');
		classes = ['app-name-span'];
		if (conf.show_sources) {
			classes.push('bold');
		}
		if (apps[i].blocked) {
			classes.push('blocked');
		} else if (!conf.selected_app_ids.hasOwnProperty(apps[i].id)) {
			classes.push('whitelisted');
		}
		app_name_span.className = classes.join(' ');
		app_name_span.appendChild(document.createTextNode(apps[i].name));
		app_name_span.title = apps[i].name;
		app_name_label.appendChild(app_name_span);
		app_name_label.id = 'for-app-' + apps[i].id;
		app_name_div.appendChild(app_name_label);

		app_div.appendChild(app_name_div);

		if (conf.show_sources) {
			var app_sources_div = document.createElement('div');
			app_sources_div.className = 'app-sources-div ellipsis';
			for (j = 0; j < apps[i].sources.length; j++) {
				app_sources_div.appendChild(createLink('http://www.ghostery.com/gcache/?n=' + encodeURIComponent(window.btoa(apps[i].name)) + '&s=' + encodeURIComponent(window.btoa(apps[i].sources[j].src)), apps[i].sources[j].src, (apps[i].sources[j].blocked ? 'app-source-link blocked' : 'app-source-link'), apps[i].sources[j].src));
				app_sources_div.appendChild(document.createElement('br'));
			}
			app_div.appendChild(app_sources_div);
		}
		app_list_div.appendChild(app_div);
	}

	apps_div.appendChild(app_list_div);
}
