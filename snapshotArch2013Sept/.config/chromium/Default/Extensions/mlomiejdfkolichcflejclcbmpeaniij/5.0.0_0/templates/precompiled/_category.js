define(function(require){
var t=require("lib/i18n").t;
return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<tr>\n\t<td class="category-arrow ';
 if (!collapsed) print('down'); 
__p+='">\n\t</td>\n\t<td class="category-checkbox">\n\t\t<input type="checkbox" class="cat-checkbox"';
 if (all_selected) print(' checked') 
__p+='>\n\t</td>\n\t<td class="category-name" title="'+
((__t=( t('category_' + id + '_desc') ))==null?'':_.escape(__t))+
'">\n\t\t<span class="help">'+
((__t=( name ))==null?'':_.escape(__t))+
'</span>\n\t</td>\n\t<td class="category-stats">\n\t\t'+
((__t=( t('number_of_trackers', apps.length.toString()) ))==null?'':_.escape(__t))+
'\n\t\t'+
((__t=( t_blocking_summary(apps.where({ selected: true }).length, apps.length, true) ))==null?'':__t)+
'\n\t</td>\n</tr>\n';
}
return __p;
};
});