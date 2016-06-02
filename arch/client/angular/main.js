^^
if(global.routers)
	$.extend(global, {angularDeps: {"ngRoute": 1}});
var str = "";
if(global.angularDeps){
str+=$.eval({evalStringArray: Object.keys(global.angularDeps), sep:","});
}$$
var app = angular.module('app', [^^=str$$]);
^^=~evalDic: global.angularDeps$$
^^
for(var key in global.subs){
 var ctrl = $.copy(global.subs[key]);
 ctrl.deps = {};
// $.eval({extend: ctrl.layout, deps: ctrl.deps}, "angular-html");
 str3 = $.eval({extend: ctrl.content, error: ctrl.error, success:ctrl.success, deps: ctrl.deps});
 var str2 = "";
 for(var key2 in ctrl.deps){
	 if(key2 == "content"){
		 str3 += $.eval(ctrl.deps[key2]);
		 continue;
	 }
	 if(ctrl.deps[key2] == "lib")
		 deps[key2] = 1;
	str2 += ", " + key2;
 }
$$
app.controller("^^=key$$Controller", function($scope^^=str2$$){
^^=str3$$
});

^^}$$
