
rootApp.controller("navbar", function($scope, $rootScope, req, auth){
	if(!$rootScope.user) $rootScope.user = auth.getuser();
	console.log($rootScope.user);
  $rootScope.$watchCollection("user", function(){
    if($rootScope.user){
      $scope.welcome = "欢迎，" + $rootScope.user.username;
    }else{
      $scope.welcome = "欢迎";
    }
  });
  $scope.signout = auth.signout;
	^^=JSON.stringify(global.impl.servers[withServer].authflags)$$.forEach(function(tag){
    $scope["is" + tag] = function(){
      if(!$rootScope.user) return false;
      return tag == "all" || $rootScope.user[tag];
    }
  });
});
