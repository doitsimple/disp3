^^
var str = "";
if(global.angularDeps){
str+=$.eval({evalStringArray: Object.keys(global.angularDeps), sep:","});
}$$
var app = angular.module('app', [^^=str$$]);
^^=~evalDic: global.angularDeps$$
^^
for(var key in global.controllers){
 var ctrl = global.controllers[key];
 ctrl.deps = {};
 str3 = $.eval({extend: ctrl.content, error: ctrl.error, success:ctrl.success, deps: ctrl.deps});
 var str2 = "";
 for(var key2 in ctrl.deps){
	str2 += ", " + key2;
 }
$$
app.controller("^^=key$$Controller", function($scope^^=str2$$){
^^=str3$$
});

^^}$$
^^
for(var key in global.angularLib){
 var toeval = {};
 toeval[key] = global.angularLib[key];
$$
^^=~toeval$$; 
^^}$$
^^=~content$$
