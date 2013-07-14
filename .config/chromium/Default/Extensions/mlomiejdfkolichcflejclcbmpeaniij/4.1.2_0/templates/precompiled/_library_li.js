var __templates=__templates||{};
__templates["_library_li"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<li>\n\t<div class="license-line">\n\t\t<a href="'+
_.escape( url )+
'" target="_blank">'+
_.escape( name )+
'</a>\n\t\t<a href="'+
_.escape( license_url )+
'" class="license-link" id="license-link-'+
_.escape( id )+
'">'+
_.escape( t("credits_show_license_link") )+
'</a>\n\t</div>\n\t<div class="license-text" id="license-text-'+
_.escape( id )+
'">\n\t\t<a href="'+
_.escape( license_url )+
'" target="_blank">'+
_.escape( license_url )+
'</a>\n\t\t<pre>'+
_.escape( license_text )+
'</pre>\n\t</div>\n</li>\n';
}
return __p;
};