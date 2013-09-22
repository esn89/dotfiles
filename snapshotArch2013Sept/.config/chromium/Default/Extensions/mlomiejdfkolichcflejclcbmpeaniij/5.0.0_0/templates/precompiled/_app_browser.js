define(function(require){
var t=require("lib/i18n").t;
return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='';

var _select = require('tpl/_select');

__p+='\n\n<table id="app-list-table" class="app-browser" role="grid">\n\t<thead>\n\t\t<tr>\n\t\t\t<th colspan="4">\n\t\t\t\t<table style="width: 100%;">\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td style="padding: 35px 0 35px 55px; width: 43%; vertical-align: top;">\n\t\t\t\t\t\t\t\t<div style="border-right: 1px solid #d7d7d7; padding-right: 40px;">\n\n\t\t\t\t\t\t\t\t\t<span id="block-status"></span>\n\t\t\t\t\t\t\t\t\t<br>\n\t\t\t\t\t\t\t\t\t<br>\n\t\t\t\t\t\t\t\t\t<span style="font-size: .75em;">\n\t\t\t\t\t\t\t\t\t\t'+
((__t=( t("options_blocking3") ))==null?'':__t)+
'\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td style="text-align: right; padding: 35px 55px 35px 0; vertical-align: top; white-space: nowrap;">\n\t\t\t\t\t\t\t\t<div style="font-weight: bold; font-size: .875em; padding-left: 40px;">\n\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t\t'+
((__t=( t('tracker_browser_type_filter', _select({
											id: 'app-list-filter-type',
											options: [
												{ name: t("all"), value: 'all' },
												{ name: t("blocked"), value: 'blocked' },
												{ name: t("unblocked"), value: 'unblocked' },
												{ name: t("new_since_last_update"), value: 'new' }
											]
										})) ))==null?'':__t)+
'\n\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t\t'+
((__t=( t('tracker_browser_name_filter', 
										'<input type="text" class="app-list-filter-name" id="app-list-filter-name" placeholder="'
										+ t("tracker_browser_name_filter_placeholder") + '">'
										+ '<span id="app-list-reset-search"></span>') ))==null?'':__t)+
'\n\t\t\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t\t\t<!-- <p>\n\t\t\t\t\t\t\t\t\t\t<a href="#" id="app-list-reset-search">'+
((__t=( t('tracker_browser_filters_reset') ))==null?'':_.escape(__t))+
'</a>\n\t\t\t\t\t\t\t\t\t</p> -->\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</tbody>\n\t\t\t\t</table>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr class="app-toggles">\n\t\t\t<th class="app-toggles-divs" colspan="4">\n\t\t\t\t<a href="#" id="expand-all">'+
((__t=( t("toggle_expand_all") ))==null?'':_.escape(__t))+
'</a>\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t<a href="#" id="collapse-all">'+
((__t=( t("toggle_collapse_all") ))==null?'':_.escape(__t))+
'</a>\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t<a href="#" id="select-all">'+
((__t=( t("toggle_select_all") ))==null?'':_.escape(__t))+
'</a>\n\t\t\t\t<span class="vr"></span>\n\t\t\t\t<a href="#" id="select-none">'+
((__t=( t("toggle_select_none") ))==null?'':_.escape(__t))+
'</a>\n\t\t\t</th>\n\t\t</tr>\n\t</thead>\n\n\t<tbody id="trackers">\n\t</tbody>\n\n\t<tbody id="no-results">\n\t\t<tr>\n\t\t\t<td colspan="4">\n\t\t\t\t'+
((__t=( t('no_results') ))==null?'':_.escape(__t))+
'\n\t\t\t</td>\n\t\t</tr>\n\t</tbody>\n</table>\n';
}
return __p;
};
});