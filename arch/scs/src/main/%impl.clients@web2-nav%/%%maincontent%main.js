
rootApp.controller("navbar", function($scope, $rootScope, req, auth){
	if(!$rootScope.user) $rootScope.user = auth.getuser();
  $rootScope.$watchCollection("user", function(){
    if($rootScope.user){
      $scope.welcome = "欢迎，" + $rootScope.user.email;
    }else{
      $scope.welcome = "欢迎";
    }
  });
  $scope.signout = auth.signout;
  $scope.isauth = function(tag){
    if(!$rootScope.user) return false;
		if($rootScope.user.admin) return true;
    return !!$rootScope.user[tag];
  }
});
