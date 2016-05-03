app.directive('jsonModifier', function($compile) {
	return {
  	require: 'ngModel',
    replace: true,
		scope: {
			v: '=ngModel',
			prefix: '=prefix'
		},
    link: function(scope, elm, attrs, ngModelCtrl) {
			console.log(attrs);
/*
    	ngModelCtrl.$formatters.unshift(function (modelValue) {
    		return modelValue;
    	});
    	ngModelCtrl.$parsers.unshift(function(viewValue) {
    		return viewValue;
    	});
*/
      ngModelCtrl.$render = function() {
				var v = scope.v;
				var html;
				if(attrs.class){
					html = '<ol class="'+attrs.class+'">';
				}else{
					html ='<ol>';
				}
				if(!scope.prefix) scope.prefix= "root";
				var prefix = scope.prefix;
				var i=0;
				for(var key in v){
				  var tmp = v[key];
					var id = prefix + "-" + i;
					if(typeof tmp == "object"){
						html+='<li class="branch"><label for="'+id+'">'+key+'</label>';
						html+='<input type="checkbox" id="'+id+'"/>';
						html+='<json-modifier ng-model="v[\''+key+'\']" prefix="'+id+'"/>';
						html+='</li>'
					}else{
						html+='<li class="leaf"><label for="'+id+'">'+key+'</label>';
						html+='<input type="text" id="'+id+'" ng-model="v[\'' + key + '\']"/>';
						html+='</li>'
					}
					i++;
				}
				html += '</ol>';
        var e =$compile(html)(scope);
				elm.replaceWith(e);
      };
  	},
  };
});
; 
app.directive('jsonDisplay', function() {
	return {
  	require: 'ngModel',
    replace: true,
		template: "<div>{{v}}</div>",
		scope: {
			v: '=ngModel'
		},
    link: function(scope, elm, attrs, ngModelCtrl) {
/*
    	ngModelCtrl.$formatters.unshift(function (modelValue) {
    		return modelValue;
    	});
*/
    	ngModelCtrl.$parsers.unshift(function(viewValue) {
    		return JSON.stringify(viewValue, undefined, 2);
    	});
  	},
  };
});; 

