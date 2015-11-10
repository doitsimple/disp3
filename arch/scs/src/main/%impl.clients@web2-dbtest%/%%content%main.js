rootApp.controller("mainController", function($scope, $rootScope, req){
$scope.template = "partial/welcome.html";
$scope.token = "abcdef";
$scope.loadTemplate = function(name){
	$scope.result = "";
	$scope.template = "partial/" + name + ".html";
}
$scope.submit= function(name, params){
}
})


