var __templates=__templates||{};
__templates["_app_browser"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<table id="app-list-table" role="grid">\n\t<thead>\n\t\t<tr>\n\t\t\t<th>\n\t\t\t\t<span id="block-status"></span>\n\t\t\t\t<br>\n\t\t\t\t<br>\n\t\t\t\t'+
_.escape( t("options_blocking3") )+
'\n\t\t\t</th>\n\t\t</tr>\n\t</thead>\n\n\t<thead id="app-filters">\n\t\t<tr>\n\t\t\t<td>\n\t\t\t\t'+
( t("tracker_browser_type_filter", _select({
					id: 'app-list-filter-type',
					options: [
						{ name: t("all"), value: 'all' },
						{ name: t("blocked"), value: 'blocked' },
						{ name: t("unblocked"), value: 'unblocked' },
						{ name: t("new_since_last_update"), value: 'new' }
					]
				})) )+
'\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t'+
( t("tracker_browser_name_filter", '<input type="text" id="app-list-filter-name" placeholder="' + t("tracker_browser_name_filter_placeholder") + '">') )+
'\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t<a href="#" id="app-list-reset-search">'+
_.escape( t("tracker_browser_filters_reset") )+
'</a>\n\t\t\t</td>\n\t\t</tr>\n\t</thead>\n\n\t<thead id="app-toggles">\n\t\t<tr>\n\t\t\t<th>\n\t\t\t\t<a href="#" id="expand-all">'+
_.escape( t("toggle_expand_all") )+
'</a>\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t<a href="#" id="collapse-all">'+
_.escape( t("toggle_collapse_all") )+
'</a>\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t<a href="#" id="select-all">'+
_.escape( t("toggle_select_all") )+
'</a>\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t<a href="#" id="select-none">'+
_.escape( t("toggle_select_none") )+
'</a>\n\t\t\t</th>\n\t\t</tr>\n\t</thead>\n\n\t<tbody id="trackers">\n\t</tbody>\n\n\t<tbody id="no-results">\n\t\t<tr>\n\t\t\t<td>\n\t\t\t\t'+
_.escape( t('no_results') )+
'\n\t\t\t</td>\n\t\t</tr>\n\t</tbody>\n</table>\n';
}
return __p;
};