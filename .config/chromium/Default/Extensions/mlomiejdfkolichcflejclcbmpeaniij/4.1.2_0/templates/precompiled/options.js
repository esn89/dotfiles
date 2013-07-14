var __templates=__templates||{};
__templates["options"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<div class="options-div" id="general-options">\n\n\t<fieldset>\n\t\t<legend>'+
_.escape( t("options_sharing_header") )+
'</legend>\n\t\t'+
( _ghostrank() )+
'\n\t\t<p>\n\t\t<label>\n\t\t\t<input type="checkbox" id="ghostrank"';
 if (conf.ghostrank) print(' checked') 
;__p+='>\n\t\t\t'+
_.escape( t("options_ghostrank") )+
'\n\t\t</label>\n\t\t</p>\n\t</fieldset>\n\n\n\t<fieldset>\n\t\t<legend>'+
_.escape( t("options_autoupdate_header") )+
'</legend>\n\t\t<p>'+
_.escape( t("walkthrough_autoupdate1") )+
'</p>\n\n\t\t<p>\n\t\t<label>\n\t\t\t<input type="checkbox" id="enable_autoupdate"';
 if (conf.enable_autoupdate) print(' checked') 
;__p+='>\n\t\t\t'+
_.escape( t("options_autoupdate") )+
'\n\t\t</label>\n\t\t<br>\n\t\t<input type="checkbox" style="visibility:hidden">\n\t\t<span style="font-size:small">\n\t\t\t<span id="apps-last-updated">\n\t\t\t\t'+
_.escape( t('library_never_updated') )+
'\n\t\t\t</span>\n\t\t\t<span id="update-now-span">\n\t\t\t\t<a href="#" id="update-now-link" aria-label="Press to immediately update Ghostery tracker lists">'+
_.escape( t('library_update_now_link') )+
'</a>\n\t\t\t</span>\n\t\t</span>\n\t\t</p>\n\t</fieldset>\n\n\n\t<fieldset>\n\t\t<legend>'+
_.escape( t("options_blocking_header") )+
'</legend>\n\t\t<p>\n\t\t\t'+
_.escape( t("options_blocking1") )+
'\n\t\t</p>\n\t\t<p style="margin-bottom:25px">\n\t\t\t<em>'+
_.escape( t("note") )+
'</em>\n\t\t\t'+
( t("options_blocking2") )+
'\n\t\t</p>\n\n\t\t<ul class="tabs" id="tabs-apps" role="navigation">\n\t\t\t<li class="active">\n\t\t\t\t<a id="apps-tab" href="#apps" data-tab-contents-selector="#app-list-table" aria-label="Tracker browser tab">'+
_.escape( t("options_trackers_tab") )+
'</a>\n\t\t\t</li>\n\t\t\t<li>\n\t\t\t\t<a id="sites-tab" href="#sites" data-tab-contents-selector="#whitelist-div" aria-label="Blocking-exempt sites tab">'+
_.escape( t("options_sites_tab") )+
'</a>\n\t\t\t</li>\n\t\t</ul>\n\n\t\t'+
( _app_browser({ _select: _select }) )+
'\n\n\t\t<div id="whitelist-div" style="display:none">\n\t\t\t<p>\n\t\t\t\t'+
_.escape( t("site_whitelist_description") )+
'\n\t\t\t</p>\n\t\t\t<p>\n\t\t\t\t'+
_.escape( t("site_whitelist_help") )+
'\n\t\t\t\t<br>\n\t\t\t\t<input type="text" id="whitelist-add-input" value="" autocomplete="off" placeholder="example.com">\n\t\t\t\t<button id="whitelist-add-button">'+
_.escape( t("whitelist_add_button") )+
'</button>\n\t\t\t</p>\n\t\t\t<p>\n\t\t\t\t'+
_.escape( t("whitelisted_sites_header") )+
'\n\t\t\t\t<br>\n\t\t\t\t<select multiple="multiple" id="whitelist"></select>\n\t\t\t\t<br>\n\t\t\t\t<button id="whitelist-remove-button">'+
_.escape( t("whitelist_remove_button") )+
'</button>\n\t\t\t\t<button id="whitelist-remove-all-button">'+
_.escape( t("whitelist_remove_all_button") )+
'</button>\n\t\t\t</p>\n\t\t</div>\n\t</fieldset>\n\n</div>\n\n<div class="options-div" id="advanced-options" style="display:none">\n\n\t<fieldset>\n\t\t<legend>\n\t\t\t'+
_.escape( t("options_display_header") )+
'\n\t\t</legend>\n\n\t\t<p>\n\t\t\t<input type="checkbox" id="show-alert"';
 if (conf.show_alert) print(' checked') 
;__p+='>\n\t\t\t'+
( '<label for="show-alert">' +
			t("options_alert_bubble", [
				'</label>' +
					'<span id="alert-bubble-help" class="help">' +
					t('alert_bubble') +
					'</span><span id="alert-bubble-options"' +
						(!conf.show_alert ? ' style="display:none"' : '') +
					'>',

				_select({
					id: 'alert-bubble-pos',
					options: [
						{ name: t("corner1"), value: 'tr' },
						{ name: t("corner2"), value: 'tl' },
						{ name: t("corner3"), value: 'br' },
						{ name: t("corner4"), value: 'bl' }
					],
					selected: conf.alert_bubble_pos
				}),

				_select({
					id: "alert-bubble-timeout",
					options: [60, 30, 25, 20, 15, 10, 5, 3],
					selected: conf.alert_bubble_timeout
				})
			]) + '</span>' )+
'\n\t\t</p>\n\n\t\t<p>\n\t\t<label>\n\t\t\t<input type="checkbox" id="show_sources"';
 if (conf.show_sources) print(' checked') 
;__p+='>\n\t\t\tShow tracker script sources\n\t\t</label>\n\t\t(in the <span id="browser-panel-help" class="help">findings panel</span>)\n\t\t</p>\n\t</fieldset>\n\n\t<fieldset>\n\t\t<legend>\n\t\t\t'+
_.escape( t("options_autoupdate_header") )+
'\n\t\t</legend>\n\t\t<p>\n\t\t<label>\n\t\t\t<input type="checkbox" id="block-by-default"';
 if (conf.block_by_default) print(' checked') 
;__p+='>\n\t\t\t'+
_.escape( t("options_block_by_default") )+
'\n\t\t</label>\n\t\t</p>\n\t\t<p>\n\t\t<label>\n\t\t\t<input type="checkbox" id="notify-library-updates"';
 if (conf.notify_library_updates) print(' checked') 
;__p+='>\n\t\t\t'+
_.escape( t("options_notify_of_library_updates") )+
'\n\t\t</label>\n\t\t</p>\n\t</fieldset>\n\n</div>\n\n<div class="options-div">\n\t<p>\n\t<button id="save-button" disabled>'+
_.escape( t("options_save_button") )+
'</button>\n\t<button id="cancel-button" disabled>'+
_.escape( t("options_cancel_button") )+
'</button>\n\t</p>\n</div>\n';
}
return __p;
};