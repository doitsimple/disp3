var rootApp = angular.module('rootApp', ^^=JSON.stringify(local.angularDeps) || '[]'$$);
rootApp.run(function($templateCache) {
  $templateCache.put('form.html', '<div class="tooltip">{{content}}</div>');
});
/*
rootApp.directive('autocomplete', function($parse) {
  return {
    require: 'ngModel',
		link: function(scope, element, attrs) {
    var setSelection = $parse(attrs.ngModel).assign;
    scope.$watch(attrs.autocomplete, function(value) {
      element.autocomplete({				
        source: value,
				delay: 0,
				minLength: 0
      });
    });
		}
	};
});
rootApp.directive('onlastrepeat', function() {
	return function(scope, element, attrs) {
		if (scope.$last) setTimeout(function() {
			scope.$emit('onRepeatLast', element, attrs);
		}, 1);
	};
});
rootApp.directive('contenteditable', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      // view -> model
      element.bind('blur', function() {
        scope.$apply(function() {
          ctrl.$setViewValue(element.html());
					ctrl.$render();
        });
      });
      // model -> view
      ctrl.$render = function() {
				if(attrs.default && 
					 (ctrl.$viewValue == "" || ctrl.$viewValue == undefined))
					element.html(attrs.default);
				else
					element.html(ctrl.$viewValue);
      };
      // load init value from DOM
			ctrl.$render();
    }
  };
});
*/
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

rootApp.factory('req', function($http){
	var methods = {};
	var ajax;
	methods.ajax = ajax = function (config, fn){
		$http(config).then(function(result){
			if(typeof result.data == "object" && result.data.error){
				alert(result.data.error);
				fn("返回结果有error", result.data, {
          statusCode: result.status,
          headers: result.headers()
        });
			}else{
				fn(null, result.data, {
					statusCode: result.status,
					headers: result.headers()
				});
			}
		}, function(result){
			if(result.status == 401){
				alert("请去登录");
				fn("没登录或登录过期", result.data, {
					statusCode: result.status,
					headers: result.headers()
				});
				return;
			}
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
		methods[method+"File"] = function(url, headers, data, fn){
			var formData=new FormData();
			for(var key in data){
				formData.append(key, data[key]);
			}
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
		methods[method+"BearerFile"] = function(url, token, data, fn){
			methods[method + "File"](url, {
				Authorization: "Bearer "+token
			}, data, fn);
		};

	});
	return methods;
});
rootApp.filter("stddate", function() {
  var filterfun = function(datestr) {
		if(!datestr) return "";
    return datestr.substr(0, 4) + "/" + datestr.substr(4, 2) + "/" + datestr.substr(6, 2);
  };
  return filterfun;
});
^^=content$$
