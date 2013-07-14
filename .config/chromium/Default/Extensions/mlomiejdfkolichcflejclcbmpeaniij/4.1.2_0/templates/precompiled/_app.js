var __templates=__templates||{};
__templates["_app"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<td width="18">\n\t<img src="images/arrow_right.gif" style="visibility:hidden">\n</td>\n<td width="20">\n\t<input type="checkbox" class="app-checkbox"';
 if (selected) print(' checked') 
;__p+='>\n</td>\n<td width="100%">\n\t<a href="https://www.ghostery.com/apps/'+
_.escape( encodeURIComponent(name.replace(/\s+/g, '_').toLowerCase()) )+
'">'+
_.escape( name )+
'</a>\n</td>\n';
}
return __p;
};