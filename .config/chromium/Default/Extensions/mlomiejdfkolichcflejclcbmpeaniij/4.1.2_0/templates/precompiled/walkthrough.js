var __templates=__templates||{};
__templates["walkthrough"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<a href="#" id="arrow-prev" class="arrow" tabindex="1" role="navigation" aria-label="previous section" style="display:none"></a>\n<a href="#" id="arrow-next" class="arrow" tabindex="1" role="navigation" aria-label="next section"></a>\n\n<button id="skip-button">'+
_.escape( t('walkthrough_skip_button') )+
'</button>\n\n<img src="/images/ghostery_about.png" width="295" height="78">\n\n<div id="walkthrough-progress">\n\t<span class="circle active"></span>\n\t<span class="circle"></span>\n\t<span class="circle"></span>\n\t<span class="circle"></span>\n\t<span class="circle"></span>\n</div>\n<div style="clear:both"></div>\n\n<div id="slider">\n\n\t<div style="display:block">\n\t\t<legend>\n\t\t\t'+
_.escape( t('walkthrough_intro_header') )+
'\n\t\t</legend>\n\t\t<p>\n\t\t\t'+
( t('welcome_to_ghostery', '<span id="version-text"></span>') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_intro1') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
( t('walkthrough_intro2') )+
'\n\t\t</p>\n\t</div>\n\n\n\t<div style="display:none">\n\t\t<legend>\n\t\t\t'+
_.escape( t('walkthrough_sharing_header') )+
'\n\t\t</legend>\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_sharing_desc') )+
'\n\t\t</p>\n\n\t\t<hr>\n\n\t\t'+
( _ghostrank() )+
'\n\t\t<p>\n\t\t\t<label>\n\t\t\t\t<input type="checkbox" id="ghostrank"';
 if (conf.ghostrank) print(' checked') 
;__p+='>\n\t\t\t\t'+
_.escape( t('walkthrough_ghostrank_checkbox') )+
'\n\t\t\t</label>\n\t\t</p>\n\n\t\t<hr>\n\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_autoupdate1') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_autoupdate3') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t<label>\n\t\t\t\t<input type="checkbox" id="enable-autoupdate"';
 if (conf.enable_autoupdate) print(' checked') 
;__p+='>\n\t\t\t\t'+
_.escape( t('walkthrough_autoupdate_checkbox') )+
'\n\t\t\t</label>\n\t\t</p>\n\t</p>\n\t</div>\n\n\n\t<div style="display:none">\n\t\t<legend>\n\t\t\t'+
_.escape( t('walkthrough_notification_header') )+
'\n\t\t</legend>\n\n\t\t<p>\n\t\t\t<img src="images/help_alert_bubble.png" class="example">\n\t\t\t'+
_.escape( t('walkthrough_notification1') )+
'\n\t\t</p>\n\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_notification2') )+
'\n\t\t</p>\n\n\t\t<p>\n\t\t\t<label>\n\t\t\t\t<input type="checkbox" id="show-alert"';
 if (conf.show_alert) print(' checked') 
;__p+='>\n\t\t\t\t'+
_.escape( t('walkthrough_notification_checkbox') )+
'\n\t\t\t</label>\n\t\t</p>\n\n\t\t<div style="clear:both"></div>\n\t</div>\n\n\n\t<div style="display:none">\n\t\t<legend>\n\t\t\t'+
_.escape( t('walkthrough_blocking_header') )+
'\n\t\t</legend>\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_blocking1') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_blocking2') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
( t('walkthrough_blocking3') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_blocking4') )+
'\n\t\t</p>\n\n\t\t'+
( _app_browser({ _select: _select }) )+
'\n\n\t</div>\n\n\n\t<div style="display:none">\n\t\t<legend>\n\t\t\t☺\n\t\t</legend>\n\t\t<p>\n\t\t\t'+
_.escape( t('walkthrough_finished1') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
( t('walkthrough_finished2') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
( t('walkthrough_finished3') )+
'\n\t\t</p>\n\t\t<p>\n\t\t\t'+
_.escape( t('thanks_for_using_ghostery') )+
'\n\t\t</p>\n\t</div>\n\n</div>\n';
}
return __p;
};