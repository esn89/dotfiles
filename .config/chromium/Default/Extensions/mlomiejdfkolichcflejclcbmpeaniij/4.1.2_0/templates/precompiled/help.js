var __templates=__templates||{};
__templates["help"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<div class="options-div">\n\t<fieldset>\n\t\t<h1>'+
_.escape( t("help_version_text", ghostery_version) )+
'</h1>\n\t\t<p>\n\t\t\t'+
_.escape( t("short_description") )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t<a href="ghostery_eula.txt">'+
_.escape( t("license_link") )+
'</a><span class="vr"></span><a href="http://www.ghostery.com/privacy">'+
_.escape( t("privacy_policy_link") )+
'</a><span class="vr"></span><a href="http://www.ghostery.com">'+
_.escape( t("homepage_link") )+
'</a>\n\t\t</p>\n\t</fieldset>\n\n\t<fieldset>\n\t\t<legend>'+
_.escape( t("help_help_header") )+
'</legend>\n\t\t<p>\n\t\t\t'+
( t("help_text1") )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
( t("help_text2") )+
'\n\t\t</p>\n\t</fieldset>\n\n\t<fieldset>\n\t\t<legend>'+
_.escape( t("help_credits_header") )+
'</legend>\n\t\t<p>\n\t\t\t'+
_.escape( t("credits_description") )+
'\n\t\t</p>\n\t\t<ul id="code-libraries">\n\t\t\t';
 _(libraries)
				.chain()
				.sortBy(function (l) { return l.name.toLowerCase() })
				.each(function (library, i) {
					library.id = i 
;__p+='\n\t\t\t\t\t'+
( _library_li(library, { variable: 'library' }) )+
'\n\t\t\t\t';
 }) 
;__p+='\n\t\t</ul>\n\t</fieldset>\n</div>\n';
}
return __p;
};