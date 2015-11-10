rootApp.controller("mainController", function($scope, $rootScope, req){
$scope.template = "partial/welcome.html";
$scope.token = "abcdef";
$scope.loadTemplate = function(name){
	$scope.result = "";
	$scope.template = "partial/" + name + ".html";
}
$scope.submit= function(name, params){
	$scope.result = "";
	if(params.isfile){
		var url = "/api/"+name;
		for(var key in this[name]){
			if(key != 'buffer')
				url += "/" + this[name][key];
		}
		req.postBearerFile(url, $scope.token, this[name], function(err, result){
			$scope.result = JSON.stringify(result, undefined, 2);
		});		
	}else{
		req.postBearer("/api/"+name, $scope.token, this[name], function(err, result){
			$scope.result = JSON.stringify(result, undefined, 2);
		});
	}
}
})


