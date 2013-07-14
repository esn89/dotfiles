var __templates=__templates||{};
__templates["_header"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<div id="header">\n\t<div id="options-top-content">\n\n\t\t';
 if (typeof ratelink_url != 'undefined') { 
;__p+='\n\t\t<p id="options-top-content-floater">\n\t\t\tLike Ghostery?\n\t\t\t<a target="new" id="ratelink" href="'+
_.escape( ratelink_url )+
'">Rate It!</a>\n\t\t\t<img src="images/star.png" width="16" height="16" alt="">\n\t\t\tAlso, <a target="_blank" href="http://www.surveymonkey.com/s/ghostghost">Take our Survey!</a>\n\t\t</p>\n\t\t';
 } 
;__p+='\n\n\t\t<img src="images/ghostery_about.png" width="295" height="78" alt="Ghostery logo">\n\n\t\t<br style="clear:both">\n\t\t<p id="walkthrough-link">\n\t\t\tFor a walkthrough of Ghostery\'s key options, try the <a href="walkthrough.html">Ghostery Configuration Wizard</a>.\n\t\t</p>\n\t\t<br style="clear:both">\n\n\t\t';
 if (typeof show_tabs != 'undefined' && show_tabs) { 
;__p+='\n\t\t<ul class="tabs" role="navigation">\n\t\t\t<li class="active"><a id="general-tab" href="#general" data-tab-contents-selector="#general-options" aria-label="general options section">'+
_.escape( t('options_general_tab') )+
'</a></li>\n\t\t\t<li><a id="advanced-tab" href="#advanced" data-tab-contents-selector="#advanced-options" aria-label="advanced options section">'+
_.escape( t('options_advanced_tab') )+
'</a></li>\n\t\t</ul>\n\t\t';
 } 
;__p+='\n\n\t</div>\n</div>\n';
}
return __p;
};