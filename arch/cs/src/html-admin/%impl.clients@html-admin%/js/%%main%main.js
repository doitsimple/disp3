var signinUrl = "/signin.html";
var redirect404 = "/404.html";

rootApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
^^
for(var i in withUis){
	if(i == "from") continue;
	var name1 = withUis[i];
  var ui = global.proto.uis[name1];
 var route;
 if(ui.isHome) route = "";
 else if(ui.params) {
	 route = name1;
	 ui.params.forEach(function(p){
		 route+="/:" + p;
	 });
 }else{
	 route = name;
 }
 var template = ui.hasOwnProperty("template")?ui.template:name1;
 var controller = ui.hasOwnProperty("controller")?ui.controller:name1;
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
^^}$$
			otherwise({
        redirectTo: '/error'
      });
}]);


rootApp.run(function ($rootScope, auth) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {

      if(!auth.gettoken()){
        event.preventDefault();
        window.location = signinUrl;
      }

    });
});



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

rootApp.factory('auth', function($http, $cookieStore, $rootScope){
  var methods = {};
  var idstr = "^^=local.name$$";
  var persist = ["token", "userid"];
  persist.forEach(function(p){
    methods["get" + p] = function(){
      var str;
      try{
        str = $cookieStore.get(p+idstr);
      }catch(e){
        return null;
      }
      return str;
    };
    methods["set" + p] = function(str){
      $cookieStore.put(p+idstr, str.toString());
    };
  });
  methods.get = function(){
    var rtn = {};
    persist.forEach(function(p){
      rtn[p] = methods["get" + p]();
    });
    return rtn;
  }
  methods.set = function(json){
    persist.forEach(function(p){
      methods["set" + p](json[p]);
    });
  }
  methods.signout = function(){
    methods.set({});
    location = signinUrl;
  }
  return methods;
});
rootApp.controller("navbar", function($scope, $rootScope, auth, req){
  $rootScope.$watchCollection("user", function(){
    if($rootScope.user){
      $scope.welcome = "欢迎，" + $rootScope.user.username;
    }else{
      $scope.welcome = "";
    }
  });
  $scope.signout = auth.signout;
  ["admin", "censor","stat","op"].forEach(function(tag){
    $scope["is" + tag] = function(){
      if(!$rootScope.user) return false;
      return $rootScope.user[tag];
    }
  });
});

