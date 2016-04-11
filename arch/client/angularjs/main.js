var app = angular.module('app', []);
^^
for(var key in global.controllers){
 var ctrl = global.controllers[key];
 
$$
app.controller("^^=key$$Controller", function($scope){
^^=~ctrl.code$$
});

^^}$$
^^
for(var key in global.angularLib){
 var toeval = {};
 toeval[key] = global.angularLib[key];
$$
^^=~toeval$$; 
^^}$$




