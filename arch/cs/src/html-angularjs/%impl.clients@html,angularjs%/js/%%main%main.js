^^if(local.mainsub){$$
^^=mainsub$$
^^}else{$$
var rootApp = angular.module('rootApp',[]);
rootApp.controller("mainController", function($scope, $rootScope, req){
^^=mainctrl$$
})
rootApp.factory('req', function($http){
	var methods = {};
	methods.get = function(url, headers, fn){
		if(!fn) fn = headers;
		if(!headers) headers = {};
		var config = {
      url: url,
      method: "GET",
      headers: headers
    };
		$http(config).then(function(result){
			fn(null, result.data, result);
		}, function(result){	
			fn(result);
		})
	}
	methods.post = function(url, data, headers, fn){
		if(!fn) fn = headers;
		if(!headers) headers = {};
		if(!data) data = "";
		var config = {
      url: url,
      method: "POST",
			data: data,
      headers: headers
    };
		$http(config).then(function(result){
			fn(null, result.data, result);
		}, function(result){	
			fn(result);
		})
	}
	return methods;
});
^^}$$
