^^origin.form = function(config){$$
$scope.^^=config.name$$ = {};
$scope.^^=config.name$$ResetForm = function(){
  for(var key in $scope.^^=config.name$$)
		$scope.^^=config.name$$[key] = "";
	^^=config.submit$$();
}
$scope.^^=config.name$$QueryForm = function(){
	^^=config.submit$$();
}
^^}$$

^^origin.table = function(config){$$
function ^^=config.submit$$(){
	console.log($scope.^^=config.query$$);
	^^=config.api$$($scope.^^=config.query$$, $scope.^^=config.name$$.sort, $scope.^^=config.name$$.currPage, $scope.^^=config.name$$.perPage, function(data){
      $scope.^^=config.name$$.data = data.data;
			$scope.^^=config.name$$.totalPage = parseInt(data.count / $scope.^^=config.name$$.perPage) || 1;
	});
}

$scope.^^=config.name$$ = {};
$scope.^^=config.name$$.data = [];
$scope.^^=config.name$$.currPage = 0;
$scope.^^=config.name$$.perPage = 10;
$scope.^^=config.name$$.totalPage = 0;
$scope.^^=config.name$$.perScreen = 5;
$scope.^^=config.name$$.sort= {
	"_id": 1
};
$scope.^^=config.name$$.adj = function(){
	var b = ($scope.^^=config.name$$.perScreen -1)/2;
	var arr =[];
	var mid = $scope.^^=config.name$$.currPage;
	if(mid <= b) mid = b+1;
	if(mid > $scope.^^=config.name$$.totalPage-b) mid = $scope.^^=config.name$$.totalPage-b;
	for(var i=mid-b; i<=mid+b; i++){
		if(i<=0) continue;
		if(i>$scope.^^=config.name$$.totalPage) continue;
		arr.push(i);
	}
	return arr;
}
$scope.^^=config.name$$.gotoPage = function(page){
	if(page == $scope.^^=config.name$$.currPage) return;
	$scope.^^=config.name$$.currPage = page;	
	^^=config.submit$$();
};
$scope.^^=config.name$$.gotoFirst = function(){
	$scope.^^=config.name$$.gotoPage(1);
}
$scope.^^=config.name$$.gotoLast = function(){
	$scope.^^=config.name$$.gotoPage($scope.^^=config.name$$.totalPage);
}
^^=config.submit$$();
$scope.$watch(function(){return $scope.^^=config.name$$.perPage}, function(oldv, newv){
	if(oldv && oldv!=newv) ^^=config.submit$$();
});
$scope.$watchCollection(function(){return $scope.^^=config.name$$.sort}, function(oldv, newv){
	if(oldv && oldv!=newv) ^^=config.submit$$();
});
^^}$$

^^origin.tab = function(config){$$
$scope.^^=config.name$$ = {};
$scope.^^=config.name$$.tabs = [
^^for(var key in config.tabs){$$
	{
		title: "^^=config.tabs[key].text$$",
		url: '^^=key$$'
	},
^^}$$
]

$scope.^^=config.name$$.currentTab = $scope.^^=config.name$$.tabs[0].url;
$scope.^^=config.name$$.onClickTab = function (tab) {
  $scope.^^=config.name$$.currentTab = tab.url;
}

$scope.^^=config.name$$.isActiveTab = function(tabUrl) {
  return tabUrl == $scope.^^=config.name$$.currentTab;
}

^^}$$

^^origin.api = function(config){$$
^^if(config.type == "list"){$$
$scope.^^=config.name$$ = {};
function ^^=config.name$$(query, sort, page, perpage, fn){
	page = page?page:1;
	$scope.^^=config.name$$.loading = true;
  req.postAuth("/api/listUser", {
		$rsort: sort,
		$match: query,
		$skip: (page-1) * perpage,
		$limit: perpage
	}, function(err, data, status){
		$scope.^^=config.name$$.loading = false;
    if(status == 200){
			fn(data);
    }
  });
}
^^}$$
^^}$$


