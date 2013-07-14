var __templates=__templates||{};
__templates["_ghostrank"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<p>\n\t'+
( t("options_sharing_notice") )+
'\n</p>\n<a href="#" id="ghostrank-moreinfo-link" aria-labelledby="ghostrank-moreinfo">'+
_.escape( t("click_for_more_info") )+
'</a>\n<div id="ghostrank-moreinfo" style="display:none">\n\t<p>\n\t\t'+
_.escape( t("options_sharing1") )+
'\n\t</p>\n\t<p>\n\t\t'+
( t("options_sharing2") )+
'\n\t</p>\n\t<p>\n\t\t'+
_.escape( t("options_sharing3") )+
'\n\t</p>\n</div>\n';
}
return __p;
};