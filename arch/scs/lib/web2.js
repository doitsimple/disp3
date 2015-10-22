^^local.panel = function(config){$$

^^}$$
^^local.form = function(config){$$
$scope["^^=config.name$$"] = {data:{}};
^^}$$
^^local.method = function(config){$$
$scope["^^=config.name$$"] = function(){
 ^^for(var sname in config.fields){var step = config.fields[sname];$$
   ^^var stepdata = step.data?"$scope."+step.data:"undefined";$$
   ^^if(step.type == "req"){$$
    ^^if(step.method == "postBearer"){$$
	req.^^=step.method$$("^^=step.url$$", auth.gettoken(), ^^=stepdata$$ || {}, function(err, result){
    ^^}else{$$
	req.^^=step.method$$("^^=step.url$$", ^^=stepdata$$, function(err, result){
    ^^}$$
			
   ^^}$$
	if(err) return;
   ^^if(step.do){$$
		^^=step.do$$;
   ^^}$$
 ^^}$$
 ^^for(var sname in config.fields){var step = config.fields[sname];$$
   ^^if(step.type == "req"){$$
	})
   ^^}$$
 ^^}$$
}
^^}$$

^^ 
local.table = function(config) {
	if (config.withSchema) {
		if(Object.keys(config.fields).length){
			for(var f in config.fields){
				$.append(config.fields[f], global.proto.schemas[config.withSchema].fields[f]);
			}
		}else{
			$.append(config.fields, global.proto.schemas[config.withSchema].fields);
		}
	}
	$$

	$scope["^^=config.name$$"] = new ui.displayTable($scope, {
		schema: "^^=config.withSchema$$",
		fields: ^^=JSON.stringify(config.fields)$$
	});
	$scope["^^=config.name$$"].fetchSaveQuerys();
	$scope["^^=config.name$$"].refresh();

^^
}
$$
^^local.loadFactory = function(config){$$

rootApp.factory("^^=config.name$$", function(req, auth){
	var methods = {};
	methods.displayTable = function($scope, config) {
		this.$scope = $scope;
		this.showsave = false;
		this.data = [];
		this.rawquerys = [];
		this.currPage = 1;
		this.totalPage = 0;
		this.perPage = 10; //the number of entries per page
		this.perPages = [5, 10, 20, 50, 100]; //the number of entries per page to select
		this.perScreen = 5; //the number of pages per screen
		this.api = config.api;
		var self = this;
		self.sort = {};
		$scope.$watch(function() {
			return self.perPage;
		}, function(oldv, newv) {
			if (oldv && oldv != newv) {
				self.currPage = 1;
				self.refresh();
			}
		});
		$scope.$watchCollection(function() {
			return self.sort;
		}, function(oldv, newv) {
			if (oldv && oldv != newv) self.refresh();
		});
		self.adj = function() {
			var b = (self.perScreen - 1) / 2;
			var arr = [];
			var mid = self.currPage;
			if (mid <= b) mid = b + 1;
			if (mid > self.totalPage - b) mid = self.totalPage - b;
			for (var i = mid - b; i <= mid + b; i++) {
				if (i <= 0) continue;
				if (i > self.totalPage) continue;
				arr.push(i);
			}
			return arr;
		};
		self.gotoPage = function(page) {
			if (page == self.currPage) return;
			self.currPage = page;
			self.refresh();
		};
		self.gotoFirst = function() {
			self.gotoPage(1);
		}
		self.gotoLast = function() {
			self.gotoPage(self.totalPage);
		}
		self.changeSort = function(key, value) {
			var json = {};
			json[key] = value || -self.sort[key] || -1;
			self.sort = json;
		}
		self.fields = config.fields;
		self.fieldlist = [];
		self.project = [];
		for(var f in self.fields){
			self.fieldlist.push(f);
		}
		self.oplist = ["=",">","<",">=","<=","!=","in","notin","match","exists","notexists"];
		self.addRawQuery =function(){
			self.rawquerys.push({op:"="});
		}
		self.formatRawQuery = function(){
			self.where = {};
			for(var qi in self.rawquerys){
				var rq = self.rawquerys[qi];
				if(!self.fields[rq.field]){
					alert(rq.field + "不存在");
					return 1;
				}
				if(!rq.field) continue;
				if(rq.op == "exists"){
					self.where[rq.field] = {$exists: true};
					continue;
				}
				if(rq.op == "notexists"){
					self.where[rq.field] = {$exists: false};
					continue;
				}					
				if(!rq.hasOwnProperty("value")) continue;
				var type = self.fields[rq.field].type;
				if(type == "string")
					rq.value = rq.value.toString();
				else if(type == "int")
					rq.value = parseInt(rq.value);
				else if(type == "float")
					rq.value = parseFloat(rq.value);
				else if(type == "date")
					rq.value = req.value;
				else if(type == "datetime")
					rq.value = req.value;
				if(rq.op == "="){
					self.where[rq.field] = rq.value;
					continue;
				}
				if(self.where[rq.field] == "="){
					alert("=不能与其他操作符共存: "+rq.field);
					return 1;
				}
				if(!self.where[rq.field]) self.where[rq.field] = {};
				if(rq.op == ">"){
					self.where[rq.field].$gt = rq.value;
				}
				if(rq.op == ">="){
					self.where[rq.field].$gte = rq.value;
				}
				if(rq.op == "<"){
					self.where[rq.field].$lt = rq.value;
				}
				if(rq.op == "<="){
					self.where[rq.field].$lte = rq.value;
				}
				if(rq.op == "!="){
					self.where[rq.field].$ne = rq.value;
				}
				if(rq.op == "in"){
					self.where[rq.field].$in = JSON.parse(rq.value);
				}
				if(rq.op == "notin"){
					self.where[rq.field].$nin = JSON.parse(rq.value);
				}
				if(rq.op == "match"){
					self.where[rq.field].$regex = rq.value;
				}
			}
		}

		self.loadSave = function(save){
			self.rawquerys = save.rawquerys || [];
			self.sort = save.sort || {};
			self.savename = save.name;
			self.refresh();
		}
		self.savePopover = 'save.html';
		self.savequerys = [];
		self.saveQuery = function(){			
			if(!self.savename){
				alert("请输入标识");
				return;
			}
			req.postBearer("/api/admin_save_query", auth.gettoken(), {
				schema: config.schema,
				data: {
					name: self.savename,
					rawquerys: self.rawquerys,
					sort: self.sort
				}
			}, function(err, data) {
				if(data.insertedId){
					self.savequerys.push({
						name: self.savename,
						rawquerys: self.rawquerys,
						sort: self.sort
					});
				}
			});
		}
		self.fetchSaveQuerys = function(){
			req.postBearer("/api/admin_get_querys", auth.gettoken(), {
				schema: config.schema
			}, function(err, data) {
				self.savequerys = data.data;
			});
		}
		self.refresh = $scope.refresh = function() {
			if(self.formatRawQuery()) return;
			req.postBearer("/api/access/"+ config.schema + "/bcolect", auth.gettoken(), {
				where: self.where,
				options: {
					$project: self.project,
					$sort: self.sort,
					$skip: (self.currPage - 1) * self.perPage,
					$limit: self.perPage
				}
			}, function(err, data) {
				self.data = data.data;
				self.count = data.count;
				self.totalPage = Math.ceil(data.count / self.perPage);
			});
		}
	}
	return methods;
});
^^}$$
