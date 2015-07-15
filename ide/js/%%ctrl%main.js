rootApp.controller("mainController", function($scope, $rootScope, req){
	var page = {};
	$scope.go = go;
	go("start");
	function go(env){
		if(typeof env == "string")
			env = {name: env};
		if(!env.part) env.part = "main";
		$scope[env.part+"page"] = "partial/" + env.name + ".html";
		page[env.part] = env.name;
		run(env);
	}

	function run(env){
		switch(env.name){
		case "start": {
			req.get("/gapi/listproject", function(err, data, info){
				$scope.projectList = data;
				console.log(data);
			})
			break;
		}
		case "project": {
			$scope.global = {};
			getFile("project.json", env, function(err, data, info){
				$scope.global.project = data;
			})
			getFile("impl.json", env, function(err, data, info){
				$scope.global.impl = data;
			})
			getFile("proto.json", env, function(err, data, info){
				$scope.global.proto = data;
			})
		}
		}
	}
	function getFile(filename, env, fn){
		req.get("/read/" + env.item.dir +  "/" + filename, fn);
	}

});
