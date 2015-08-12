^^origin.displayJson = function(config){$$
^^}$$
^^origin.format = function(config){$$

$scope.toggle = function(model){
	if(!model.$sub) model.$sub = {};
	model.$sub.$collapse = !model.$sub.$collapse;
}

^^}$$
^^origin.table = function(config){$$
	$scope["^^=config.name$$"] = new displayTable($scope, {
		api: "^^=config.api$$"
	});
	$scope["^^=config.name$$"].refresh();
$scope.xxx = 1;
$scope.aaa=["A","ab", "cb"];
//$scope.test.querys=[{name:"A"},{name:"B"}];
function displayTable($scope, config){
	if(!config.api){console.error("no api"); return}
	this.$scope = $scope;
	this.data = [];
	this.currPage = 1;
	this.totalPage = 0;
	this.perPage = 10; //the number of entries per page
	this.perScreen = 5; //the number of pages per screen
	this.api = config.api;
	var self = this;
	self.sort = {};
	$scope.$watch(function(){
		return self.perPage;
	}, function(oldv, newv){
		if(oldv && oldv!=newv) {
			self.currPage = 1;
			self.refresh();
		}
	});
	$scope.$watchCollection(function(){
		return self.sort;
	}, function(oldv, newv){
		if(oldv && oldv!=newv) self.refresh();
	});
	self.adj = function(){
		var b = (self.perScreen -1)/2;
		var arr =[];
		var mid = self.currPage;
		if(mid <= b) mid = b+1;
		if(mid > self.totalPage-b) mid = self.totalPage-b;
		for(var i=mid-b; i<=mid+b; i++){
			if(i<=0) continue;
			if(i>self.totalPage) continue;
			arr.push(i);
		}
		return arr;
	};
	self.gotoPage = function(page){
		if(page == self.currPage) return;
		self.currPage = page;	
		self.refresh();
	};
	self.gotoFirst = function(){
		self.gotoPage(1);
	}
	self.gotoLast = function(){
		self.gotoPage(self.totalPage);
	}
	self.changeSort = function(key, value){
		var json = {};
		json[key] = value || -self.sort[key] || -1;
		self.sort = json;
	}
	self.refresh = function(){
		req.postJson("/api/" + self.api, {
			where: self.where || {},
			op: {
				$sort: self.sort,
				$skip: (self.currPage-1) * self.perPage,
				$limit: self.perPage
			}
		}, function(err, data){
			console.log(data);
			self.data = data.data;
			self.count = data.count;
			self.totalPage = Math.ceil(data.count / self.perPage);
		});
	}
}
^^}$$
