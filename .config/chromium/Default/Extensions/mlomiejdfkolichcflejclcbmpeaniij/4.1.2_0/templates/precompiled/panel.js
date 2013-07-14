var __templates=__templates||{};
__templates["panel"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<div id="apps-div">\n</div>\n\n<div id="blocking-options-div" class="border-top-gray">\n\t<div class="ellipsis">\n\t\t<a href="#" tabIndex="1" role="button" id="edit-blocking-link">'+
_.escape( t('edit_blocking_options_button') )+
'</a>\n\t\t<a href="#" tabIndex="0" role="button" id="whitelist-site-link"></a>\n\t</div>\n</div>\n\n';
 // TODO make text buttons clickable anywhere in the button 
;__p+='\n';
 // TODO make image buttons tabbable 
;__p+='\n<div id="menu-div" class="border-top-gray">\n\t<a tabIndex="0" role="button" href="#" id="pause-blocking">\n\t\t<img src="/images/panel/'+
_.escape( paused ? 'play' : 'pause' )+
'.png"\n\t\t\twidth="57" height="25"\n\t\t\ttitle="'+
_.escape( t('panel_' + (paused ? 'resume' : 'pause') + '_button') )+
'">\n\t</a>\n\t<a id="options" tabIndex="0" role="button" href="#">\n\t\t<img src="/images/panel/settings.png" width="57" height="25" title="'+
_.escape( t('panel_options_button') )+
'">\n\t</a>\n\t<a tabIndex="0" role="button" href="http://www.ghostery.com/feedback" target="_blank">\n\t\t<img src="/images/panel/email.png" width="57" height="25" title="'+
_.escape( t('panel_feedback_button') )+
'">\n\t</a>\n\t<a id="help" tabIndex="0" role="button" href="#">\n\t\t<img src="/images/panel/questions.png" width="57" height="25" title="'+
_.escape( t('panel_help_button') )+
'">\n\t</a>\n\t<a tabIndex="0" role="button" href="http://www.ghostery.com/share" target="_blank">\n\t\t<img src="/images/panel/chat.png" width="57" height="25" title="'+
_.escape( t('panel_share_ghostery_button') )+
'">\n\t</a>\n</div>\n';
}
return __p;
};