var redirect401 = "#/signin";
var redirect404 = "#/";

var rootApp = angular.module('rootApp', [
	'ngRoute', 'ngCookies'
]);


rootApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
^^
for(var i in withUis){
	if(i=="from") continue;
	var name = withUis[i];
	var ui = global.proto.uis[name];
 var route;
 if(ui.isHome) route = "";
 else if(ui.params) {
	 route = name;
	 ui.params.forEach(function(p){
		 route+="/:" + p;
	 });
 }else{
	 route = name;
 }
 var template = ui.hasOwnProperty("template")?ui.template:name;
 var controller = ui.hasOwnProperty("controller")?ui.controller:name;

$$
  ^^if(ui.redirect){$$
			when('/^^=route$$', {
				redirectTo: '/^^=ui.redirect$$'
			}).
  ^^}else{$$
			when('/^^=route$$', {
				templateUrl: 'partial/^^=template$$.html',
				controller: '^^=methods.dash2uc(controller)$$'
			}).
  ^^}$$
^^}$$
			otherwise({
        redirectTo: '/error'
      });
}]);


rootApp.run(function ($rootScope, auth) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
			if(next.\$\$route.originalPath == "/signin" || next.\$\$route.originalPath == "/") return;
      if(!auth.getToken()){
        event.preventDefault();
        window.location = redirect401;
      }

    });
});



^^
for(var i in withUis){
	if(i=="from") continue;
	var name = withUis[i];
	var ui = global.proto.uis[name];
 var controller = ui.hasOwnProperty("controller")?ui.controller:name;


$$
rootApp.controller("^^=methods.dash2uc(controller)$$", function($scope, $rootScope, $routeParams, $sce, auth, req){
^^=local[ui.name]$$
^^
 for(var j in ui.withApis){
	if(j=="from") continue;
  var api = global.proto.apis[ui.withApis[j]];
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
rootApp.directive('video', function() {
  return {
    restrict: 'E',
    link: function(scope, element) {
      scope.$on('$destroy', function() {
        element.prop('src', '');
      });
    }
  };
})
rootApp.directive('fileModel', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;

      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);



rootApp.factory('auth', function($http, $cookieStore, $rootScope){
	var methods = {};
	var idstr = "^^=name$$";
	methods.getToken = function(){
		var token;
		try{
			token = $cookieStore.get('token'+idstr);
		}catch(e){
			return null;
		}
		return token;
	};
	methods.setToken = function(token){
		$cookieStore.put('token'+idstr, token);
	};
	methods.getUserId = function(){
		var token;
		try{
			token = $cookieStore.get('userid'+idstr);
		}catch(e){
			return null;
		}
		return token;
	};
	methods.setUserId = function(userid){
		$cookieStore.put('userid'+idstr, userid);
	};
	methods.getUser = function() {
    var user, userTemp;
    try {
      user = JSON.parse($cookieStore.get('user'));
    }catch(e) {
      return null;
    }
    return user;
  };
  methods.setUser = function(user) {
    var str = JSON.stringify(user);
    $cookieStore.put('user', str);
  };

	methods.signout = function(){
		methods.setToken("");
		methods.setUserId("");
		$rootScope.user = undefined;
		location = "#/";
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

rootApp.factory('req', function($http, auth){
	var methods = {};
	["get", "delete"].forEach(function(method){
		methods[method] = function(route, isAuth){
			var url = route;
			var config = {
				url: url,
				method: method.toUpperCase(),
				headers: {}
			};
			if(isAuth)
				config.headers.Authorization = "Bearer " + auth.getToken();
			return $http(config);
		};
	});
	["put", "post"].forEach(function(method){
		methods[method] = function(route, isAuth, data){
			var url = route;
			var config = {
				url: url,
				method: method.toUpperCase(),
				data: data,
				headers: {}
			};
			if(isAuth)
				config.headers.Authorization = "Bearer " + auth.getToken();
			return $http(config);
		};
	});
	methods["postMultipart"] = function(route, isAuth, file){
		var formData=new FormData();
		formData.append("buffer", file);
		var url = route;
		var config = {
			url: url,
			method: "POST",
			data: formData,
			headers: {
				'Content-Type': undefined
			},
			transformRequest: angular.identity
		};
		if(isAuth)
			config.headers.Authorization = "Bearer " + auth.getToken();
		return $http(config);
	}
	var finalMethods = {};
	["get", "delete"].forEach(function(method){
		finalMethods[method] = function(route, fn){
			methods[method](route, false).then(function(result){
				fn(null, result.data, result.status);
			}, function(err){
				fn(err);
			});
		}
		finalMethods[method + "Auth"] = function(route, fn){
			methods[method](route, true).then(function(result){

				fn(null, result.data, result.status);
			}, function(result){
				if(result.status == 401)
					location = redirect401;
				fn(result);
			});
		}
	});

	["post", "put", "postMultipart"].forEach(function(method){
		finalMethods[method] = function(route, data, fn){
			methods[method](route, false, data).then(function(result){
				fn(null, result.data, result.status);
			}, function(err){
				fn(err);
			});
		}
		finalMethods[method + "Auth"] = function(route, data, fn){
			methods[method](route, true, data).then(function(result){
				fn(null, result.data, result.status);
			}, function(result){
				if(result.status == 401)
					location = redirect401;
				fn(result);
			});
		}
	});
	return finalMethods;
});

^^=controllers$$
