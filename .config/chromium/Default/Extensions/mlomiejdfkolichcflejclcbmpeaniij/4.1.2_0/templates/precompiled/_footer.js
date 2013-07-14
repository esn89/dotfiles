var __templates=__templates||{};
__templates["_footer"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<div id="footer" role="contentinfo">\n\t'+
( t("copyright", "<a href='http://www.evidon.com' target='_blank'>EVIDON, Inc.</a>, 10 East 39<sup>th</sup> Street, 8<sup>th</sup> Floor, New York, NY 10016") )+
'\n</div>\n';
}
return __p;
};