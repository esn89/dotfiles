var __templates=__templates||{};
__templates["_select"]=function(obj){
var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};
with(obj||{}){
__p+='<select id="'+
_.escape( id )+
'">\n\t';
 _.each(options, function (option) { 
;__p+='\n\t\t';
 if (option.hasOwnProperty('value')) { 
;__p+='\n\t\t\t<option value="'+
_.escape( option.value )+
'"';
 if (typeof selected != 'undefined' && option.value === selected) print(' selected') 
;__p+='>\n\t\t\t\t'+
_.escape( option.name )+
'\n\t\t\t</option>\n\t\t';
 } else { 
;__p+='\n\t\t\t<option';
 if (typeof selected != 'undefined' && option === selected) print(' selected') 
;__p+='>\n\t\t\t\t'+
_.escape( option )+
'\n\t\t\t</option>\n\t\t';
 } 
;__p+='\n\t';
 }) 
;__p+='\n</select>\n';
}
return __p;
};