rootApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
^^
var hasError = false;
for(var i in withUis){
	if(i == "from") continue;
	var name1 = withUis[i];
  var ui = global.proto.uis[name1];
 var route;
 if(ui.isHome)
  route = "";
 else
	route = ui.route || name1;

 var template = ui.hasOwnProperty("template")?ui.template:name1;
 var controller = ui.hasOwnProperty("controller")?ui.controller:name1;
 if(route == 'error') hasError = true;
$$
  ^^if(ui.redirect){$$
			when('/^^=route$$', {
				redirectTo: '/^^=ui.redirect$$'
			}).
  ^^}else{$$
			when('/^^=route$$', {
				templateUrl: 'partial/^^=template$$.html',
				controller: '^^=methods.dash2uc(controller)$$Controller'
			}).
  ^^}$$
  ^^if(!hasError){$$
			when('/error', {
				templateUrl: 'partial/404.html',
				controller: 'error'
			}).
  ^^}$$
^^}$$
			otherwise({
        redirectTo: '/error'
      });
}]);



^^
for(var i in withUis){
	if(i == "from") continue;
  var name1 = withUis[i];
  var ui = global.proto.uis[name1];
$$
rootApp.controller("^^=methods.dash2uc(ui.name)$$Controller", function($scope, $rootScope, $routeParams, $sce, auth, req){
^^=local[ui.name]$$
^^
 for(var j in ui.withApis){
	if(j == "from") continue;
	var api= global.proto.apis[ui.withApis[j]];
  origin.api(api);
 };
 for(var key in ui.elements){
  var el = ui.elements[key];
  if(origin[el.type])
  origin[el.type](el);
 }
$$

})
^^};$$

^^if(!hasError){$$
rootApp.controller("error", function($scope, $rootScope, req){
});
^^}$$
