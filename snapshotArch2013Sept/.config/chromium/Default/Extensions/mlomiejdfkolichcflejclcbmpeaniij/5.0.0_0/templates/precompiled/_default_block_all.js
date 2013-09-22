define(function(require){
var t=require("lib/i18n").t;
return function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="ellipsis" id="block-default-message">\n\t'+
((__t=( t("block_by_default_helper_text") ))==null?'':_.escape(__t))+
'\n\t<span>\n\t\t<a href="#" id="block-default-disable">'+
((__t=( t("block_by_default_helper_cancel") ))==null?'':_.escape(__t))+
'</a>\n\t</span>\n\t<span id=\'block-default-msg-close\'></span>\n</div>\n';
}
return __p;
};
});