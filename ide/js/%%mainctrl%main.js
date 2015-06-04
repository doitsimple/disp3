req.get("/read/test1/project.json", function(err, data, info){
	$scope.data = data;
	console.log(info);
})
