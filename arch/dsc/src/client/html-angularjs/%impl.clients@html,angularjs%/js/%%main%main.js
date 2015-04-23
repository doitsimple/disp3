var rootApp = angular.module('rootApp', [
	'ngRoute', 'ngCookies'
]);


rootApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
^^
for(var name in global.proto.uis){
 var ui = global.proto.uis[name];
 var route = ui.route?ui.route:name;
$$
			when('/^^=route$$', {
				templateUrl: 'partial/^^=name$$.html',
				controller: '^^=methods.dash2uc(name)$$'
			}).
^^}$$
			otherwise({
        redirectTo: '/error'
      });
}]);

^^
for(var name in global.proto.uis){
 var ui = global.proto.uis[name];
 var route = ui.route?ui.route:name;
$$
rootApp.controller("^^=methods.dash2uc(name)$$", function($scope){
^^=local[name]$$
})
^^}$$

