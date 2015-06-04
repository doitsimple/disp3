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

