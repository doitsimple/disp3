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
rootApp.controller("^^=methods.dash2uc(name)$$", function($scope, auth, req){
^^=local[name]$$
})
^^}$$


rootApp.factory('auth', function($http, $cookieStore){
	var methods = {};
	methods.getToken = function(){
		var token;
		try{
			token = $cookieStore.get('token^^=port$$');
		}catch(e){
			return null;
		}
		return token;
	};
  return methods;
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
			}, function(err){
				fn(err);
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
			}, function(err){
				fn(err);
			});
		}
	});
	return finalMethods;
});
