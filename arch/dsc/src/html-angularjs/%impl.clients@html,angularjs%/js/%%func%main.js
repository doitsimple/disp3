^^origin.form = function(config){$$
^^if(config.default){$$
$scope.^^=config.name$$ = ^^=JSON.stringify(config.default)$$;
^^}else{$$
$scope.^^=config.name$$ = {};
^^}$$
if(!$scope.^^=config.name$$.$match)
	$scope.^^=config.name$$.$match = {};
if(!$scope.^^=config.name$$.$eq)
	$scope.^^=config.name$$.$eq = {};
if(!$scope.^^=config.name$$.$gt)
	$scope.^^=config.name$$.$gt = {};
if(!$scope.^^=config.name$$.$lt)
	$scope.^^=config.name$$.$lt = {};
if(!$scope.^^=config.name$$.$ne)
	$scope.^^=config.name$$.$ne = {};
if(!$scope.^^=config.name$$.$exists)
	$scope.^^=config.name$$.$exists = {};

^^for (var name in config.inputs){var input = config.inputs[name];$$
 ^^if(input.default){$$
	^^if(input.eq){$$
	$scope.^^=config.name$$.$eq.^^=name$$ = "^^=input.default$$";
	^^}else if(input.match){$$
	$scope.^^=config.name$$.$match.^^=name$$ = "^^=input.default$$";
	^^}else if(input.lt){$$
	$scope.^^=config.name$$.$lt.^^=name$$ = "^^=input.default$$";
	^^}else if(input.gt){$$
	$scope.^^=config.name$$.$gt.^^=name$$ = "^^=input.default$$";
	^^}else if(input.ne){$$
	$scope.^^=config.name$$.$ne.^^=name$$ = "^^=input.default$$";
	^^}else if(input.exists){$$
	$scope.^^=config.name$$.$exists.^^=name$$ = "^^=input.default$$";
	^^}else{$$
	$scope.^^=config.name$$.^^=name$$ = "^^=input.default$$";
  ^^}$$
 ^^}$$
^^}$$
$scope.^^=config.name$$ResetForm = function(){
  for(var key in $scope.^^=config.name$$)
		$scope.^^=config.name$$[key] = "";
	^^=config.submit$$();
}
$scope.^^=config.name$$QueryForm = function(){
	for(var key in $scope.^^=config.name$$.$gt){
		if($scope.^^=config.name$$.$lt[key]){
			$scope.query.$range = $scope.query.$range || {}
			$scope.^^=config.name$$.$range[key] = [$scope.^^=config.name$$.$gt[key], $scope.^^=config.name$$.$lt[key]];
			 delete $scope.^^=config.name$$.$gt[key];
			delete $scope.^^=config.name$$.$lt[key];			
		}
	}
	^^=config.submit$$();
}
^^}$$

^^origin.table = function(config){$$
function ^^=config.submit$$(){
	$scope.^^=config.api$$($scope.^^=config.query$$, $scope.^^=config.name$$.sort, $scope.^^=config.name$$.currPage, $scope.^^=config.name$$.perPage, function(data){
      $scope.^^=config.name$$.data = data.data;
			$scope.^^=config.name$$.count = data.count;
			$scope.^^=config.name$$.totalPage = Math.ceil(data.count / $scope.^^=config.name$$.perPage);
	});
}

$scope.^^=config.name$$ = {};
$scope.^^=config.name$$.data = [];
$scope.^^=config.name$$.currPage = 0;
$scope.^^=config.name$$.perPage = 10;
$scope.^^=config.name$$.totalPage = 0;
$scope.^^=config.name$$.perScreen = 5;
^^if(config.sort){$$
$scope.^^=config.name$$.sort= ^^=JSON.stringify(config.sort)$$;
^^}else{$$
$scope.^^=config.name$$.sort= {
	"_id": 1
};
^^}$$
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
$scope.^^=config.name$$ = function(query, sort, page, perpage, fn){
	page = page?page:1;
	$scope.^^=config.name$$.loading = true;
	var json = {
    $rsort: sort,
    $skip: (page-1) * perpage,
    $limit: perpage
  };
	for(var key in query)
		json[key] = query[key];
  req.postAuth("/api/^^=config.name$$", json, function(err, data, status){
		$scope.^^=config.name$$.loading = false;
    if(status == 200){
			fn(data);
    }
  });
}
^^}$$
^^}$$


^^origin.tableraw = function(config){$$

^^}$$
