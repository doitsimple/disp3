^^
origin.form = function(config){
$$
$scope.^^=config.model$$ = {};
$scope.^^=config.model$$.resetForm = function(){
  $scope.^^=config.model$$ = {};
}
$scope.^^=config.model$$.queryForm = function(){
	^^=config.submit$$($scope.query);
}
^^
}
$$

^^
origin.table = function(config){
$$
$scope.^^=config.model$$ = {};
$scope.^^=config.model$$.data = [];
$scope.^^=config.model$$.currPage = 0;
$scope.^^=config.model$$.perPage = 10;
$scope.^^=config.model$$.totalPage = 0;
$scope.^^=config.model$$.perScreen = 5;
$scope.^^=config.model$$.adj = function(){
	var b = ($scope.^^=config.model$$.perScreen -1)/2;
	var arr =[];
	var mid = $scope.^^=config.model$$.currPage;
	if(mid <= b) mid = b+1;
	if(mid > $scope.^^=config.model$$.totalPage-b) mid = $scope.^^=config.model$$.totalPage-b;
	for(var i=mid-b; i<=mid+b; i++){
		if(i<=0) continue;
		if(i>$scope.^^=config.model$$.totalPage) continue;
		arr.push(i);
	}
	return arr;
}
$scope.^^=config.model$$.gotoPage = function(page){
	if(page == $scope.^^=config.model$$.currPage) return;
	^^=config.req$$($scope.^^=config.query$$, page);
};
$scope.^^=config.model$$.gotoFirst = function(){
	$scope.^^=config.model$$.gotoPage(1);
}
$scope.^^=config.model$$.gotoLast = function(){
	$scope.^^=config.model$$.gotoPage($scope.^^=config.model$$.totalPage);
}
function ^^=config.req$$(query, page){
	page = page?page:1;
	console.log("query");
	$scope.^^=config.model$$.loading = true;
  req.postAuth("/api/listUser", {
		$match: query,
		$skip: (page-1) * $scope.^^=config.model$$.perPage,
		$limit: $scope.^^=config.model$$.perPage
	}, function(err, data, status){
		$scope.^^=config.model$$.loading = false;
    if(status == 200){
      console.log(data);
      $scope.^^=config.model$$.data = data.data;
			$scope.^^=config.model$$.currPage = page;
			$scope.^^=config.model$$.totalPage = parseInt(data.count / $scope.^^=config.model$$.perPage) + 1;
    }
  });
}
^^=config.req$$($scope.^^=config.query$$);
^^
}
$$



