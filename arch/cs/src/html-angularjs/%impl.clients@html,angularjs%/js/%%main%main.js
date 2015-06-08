^^if(local.mainsub){$$
^^=mainsub$$
^^}else{$$
var rootApp = angular.module('rootApp',[]);
rootApp.controller("mainController", function($scope, $rootScope, req){
^^=ctrl$$
})
rootApp.factory('req', function($http){
	var methods = {};
	var ajax;
	methods.ajax = ajax = function (config, fn){
		$http(config).then(function(result){
			fn(null, result.data, {
				statusCode: result.status,
				headers: result.headers()
			});
		}, function(result){
			fn(config.method +" " + config.url + " FAILED", result.data, {
				statusCode: result.status,
        headers: result.headers()
			});
		})
	};
	["get", "post", "put", "delete"].forEach(function(method){
		methods[method] = function(url, data, fn){
			if(!fn) fn = data;
			var config = {url: url, method: method.toUpperCase()};
			if(data) config.data = data;
			ajax(config, fn);
		};
		methods[method + "Ex"] = function(url, headers, data, fn){
			if(!fn) fn = data;
			var config = {url: url, method: method.toUpperCase(), headers: headers};
			if(data) config.data = data;
			ajax(config, fn);			
		};
		methods[method+"Bearer"] = function(url, token, data, fn){
			methods[method + "Ex"](url, {
				Authorization: "Bearer "+token
			}, data, fn);
		};
		methods[method+"Form"] = function(url, data, fn){
			methods[method + "Ex"](url, {
				"Content-type": "application/x-www-form-urlencoded"
			}, data, fn);
		};
		methods[method+"Json"] = function(url, data, fn){
			methods[method + "Ex"](url, {
				"Content-type": "application/json"
			}, data, fn);
		};
		methods[method + "Cookies"] = function(url, cookies, data, fn){
			var cookiearr = [];
			for(var key in cookies)
				cookiearr.push(key + "=" + cookies[key]);
			methods[method + "Ex"](url, {
				Cookie: cookiearr.join("; ")
			}, data, fn);
		};
		methods[method+"File"] = function(url, headers, file, fn){
			var formData=new FormData();
			formData.append("buffer", file);
			var config = {
				url: url,
				method: method.toUpperCase(),
				data: formData,
				headers: {
					'Content-Type': undefined
				},
				transformRequest: angular.identity
			};
			if(headers)
				for(var key in headers)
					if(key != 'Content-Type')
						config.headers[key] = headers[key];
			ajax(config, fn);
		};

	});
	return methods;
});
^^}$$
