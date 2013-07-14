var __templates=__templates||{};
__templates["_app_info"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<td colspan="3" class="app-info';
 if (loading) print(' loading') 
;__p+='">\n\n\t<div role="contentinfo" class="aboutbox"';
 if (hidden) print(' style="display:none"') 
;__p+='>\n\n\t';
 if (!loading) { 
;__p+='\n\n\t\t\t';
 if (success) { 
;__p+='\n\n\t\t\t\t<img class="company-logo" src="'+
_.escape( company_logo_url )+
'">\n\n\t\t\t\t<h1>'+
_.escape( t('company_about', company_name) )+
'</h1>\n\n\t\t\t\t';
 if (company_app.length && !(company_app.length == 1 && company_name == name)) { 
;__p+='\n\t\t\t\t\t<p>\n\t\t\t\t\t\t'+
_.escape( t('company_operates', company_name) )+
'\n\t\t\t\t\t\t'+
_.escape( _.pluck(company_app, 'ca_name').join(', ') )+
'\n\t\t\t\t\t</p>\n\t\t\t\t';
 } 
;__p+='\n\n\t\t\t\t<p>\n\t\t\t\t\t'+
_.escape( company_description )+
'\n\t\t\t\t</p>\n\n\t\t\t\t<p>\n\t\t\t\t\t<h2>'+
_.escape( t('company_website') )+
'</h2>\n\t\t\t\t\t<a href="'+
_.escape( company_website_url )+
'" rel="nofollow" target="_blank">'+
_.escape( company_website_url )+
'</a>\n\t\t\t\t</p>\n\n\t\t\t\t<p>\n\t\t\t\t\t<h2>'+
_.escape( t('company_affiliations') )+
'</h2>\n\t\t\t\t\t';
 if (!affiliation_groups.length) { 
;__p+='\n\t\t\t\t\t\t'+
_.escape( t('none') )+
'\n\t\t\t\t\t';
 } else {
						_(affiliation_groups).chain().pluck('ag_logo_url').each(function (logo_url) {
							
;__p+='<img src="'+
_.escape( logo_url )+
'" height=20> ';

						})
					} 
;__p+='\n\t\t\t\t</p>\n\n\t\t\t';
 } else { 
;__p+='\n\n\t\t\t\t<h1>'+
_.escape( t('company_profile_error') )+
'</h1>\n\t\t\t\t<br>\n\n\t\t\t';
 } 
;__p+='\n\n\t\t\t<h2>\n\t\t\t\t<a target="_blank" href="https://www.ghostery.com/apps/'+
_.escape( encodeURIComponent(name.replace(/\s+/g, '_').toLowerCase()) )+
'">'+
_.escape( t('company_profile_link') )+
'</a>\n\t\t\t</h2>\n\n\t';
 } 
;__p+='\n\n\t</div>\n\n</td>\n';
}
return __p;
};