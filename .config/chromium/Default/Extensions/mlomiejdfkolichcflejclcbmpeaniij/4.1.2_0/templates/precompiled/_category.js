var __templates=__templates||{};
__templates["_category"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<tr>\n\t<td>\n\t\t<img src="images/arrow_';
 print(collapsed ? 'right' : 'down') 
;__p+='.gif">\n\t</td>\n\t<td>\n\t\t<input type="checkbox" class="cat-checkbox"';
 if (all_selected) print(' checked') 
;__p+='>\n\t</td>\n\t<td>\n\t\t<span class="category-name help" title="'+
_.escape( t('category_' + id + '_desc') )+
'">'+
_.escape( name )+
'</span>\n\t\t<span class="category-stats">\n\t\t\t'+
_.escape( t('number_of_trackers', apps.length.toString()) )+
'\n\t\t\t'+
( t_blocking_summary(apps.where({ selected: true }).length, apps.length, true) )+
'\n\t\t</span>\n\t</td>\n</tr>\n';
}
return __p;
};