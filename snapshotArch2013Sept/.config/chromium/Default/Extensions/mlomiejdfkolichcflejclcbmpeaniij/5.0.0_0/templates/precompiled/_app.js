define(function(require){
var t=require("lib/i18n").t;
return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<td class="app-arrow">&nbsp;</td>\n<td class="app-checkbox">\n\t<input type="checkbox"';
 if (selected) print(' checked') 
__p+='>\n</td>\n<td class="app-row-name">\n\t<a href="https://www.ghostery.com/apps/'+
((__t=( encodeURIComponent(name.replace(/\s+/g, '_').toLowerCase()) ))==null?'':_.escape(__t))+
'">'+
((__t=( name))==null?'':_.escape(__t))+
'</a>\n</td>\n';
}
return __p;
};
});