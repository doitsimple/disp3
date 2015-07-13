^^origin.displayTable = function(config){$$
	$scope["^^=config.name$$"] = new displayTable($scope, {
		api: "^^=config.api$$"
	});
	$scope["^^=config.name$$"].refresh();
$scope.xxx=1;
$scope.aaa=["A","ab", "cb"];
$scope.test.querys=[{name:"A"},{name:"B"}];
 ^^if(!local.hasDisplayTable){local.hasDisplayTable = 1;$$
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
		if(oldv && oldv!=newv) self.refresh();
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
			console.log("re");
		req.postJson("/api/" + self.api, {
			where: self.where || {},
			op: {
				$sort: self.sort,
				$skip: (self.currPage-1) * self.perPage,
				$limit: self.perPage
			}
		}, function(err, data){
			console.log(err);
			console.log(data);
/*
		var data = {
			data: [{aaa:"12222222222 222222 2222jkhjf1h2rui 21hf1221f21uh rfu21hufh12uhf21hf1fuh2uihfi1hfi12hfi1h2f1221",bbb:"23423423333333 3333333333333 33333333333333333"},{aaa:1,bbb:2},{aaa:1,bbb:2},{aaa:1,bbb:3}],
			count: 10
		}
*/
			self.data = data.data;
			self.count = data.count;
			self.totalPage = Math.ceil(data.count / self.perPage);		
		});
	}
}
 ^^}$$
^^}$$
