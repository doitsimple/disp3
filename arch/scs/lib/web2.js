^^function appendconfig(config){
 if(!config.refs) config.refs = {};
	if (config.withSchema) {
		if(Object.keys(config.fields).length){
			for(var f in config.fields){
				$.append(config.fields[f], global.proto.schemas[config.withSchema].fields[f]);
			}
		}else{
			$.append(config.fields, global.proto.schemas[config.withSchema].fields);
		}
	}
  for(var f in config.fields){
		if(config.fields[f].ref){
			var fields = global.proto.schemas[config.fields[f].ref].fields;
			var ref = config.refs[config.fields[f].ref] = {
				fields: fields,
				field: f,
				fieldlist: Object.keys(fields)
			};	
		}
	}
}$$

^^local.panel = function(config){
appendconfig(config);
$$

$scope["^^=config.name$$"] = {};
if(!$scope.schemas) $scope.schemas = {};
$scope["^^=config.name$$"].refresh = function(force){
	if(!force && $scope.schemas["^^=config.withSchema$$"]) return;
	$scope.schemas["^^=config.withSchema$$"] = {};
^^var method;if(config.islist){method = "bselect";}else{method="select";}$$
	req.postBearer("/api/access/^^=config.withSchema$$/^^=method$$", auth.gettoken(), {
		where: ^^=config.where$$,
		options: {}
	}, function(err, data) {
		$scope.schemas["^^=config.withSchema$$"] = data;
	});
}
$scope["^^=config.name$$"].refresh();
 ^^for(var sname in config.fields){var step = config.fields[sname];$$  
 ^^}$$
^^}$$
^^local.form = function(config){$$
$scope["^^=config.name$$"] = {};
^^}$$
^^local.method = function(config){config.params = config.params || "";$$
$scope["^^=config.name$$"] = function(^^=config.params$$){
 ^^for(var sname in config.fields){var step = config.fields[sname];$$
   ^^var stepdata = step.data?step.data:"undefined";$$
   ^^if(step.pre){$$
		^^=step.pre$$;
   ^^}$$
   ^^if(step.type == "req"){$$
    ^^if(step.method == "postBearer"){$$
	req.^^=step.method$$("^^=step.url$$", auth.gettoken(), ^^=stepdata$$ || {}, function(err, result){
    ^^}else{$$
	req.^^=step.method$$("^^=step.url$$", ^^=stepdata$$, function(err, result){
    ^^}$$			
   ^^}else{$$
		var err=null;
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
^^if(config.runonload){$$
$scope["^^=config.name$$"]();
^^}$$


^^}$$

^^ 
local.table = function(config) {
appendconfig(config);
	$$
	var params = {
    schema: "^^=config.withSchema$$",
    fields: ^^=$.stringify(config.fields)$$,
		fieldlist: ^^=$.stringify(Object.keys(config.fields))$$,
		refs: ^^=$.stringify(config.refs)$$
  }
	^^if(config.where){$$
	params.where = ^^=config.where$$;
  ^^}$$
	^^if(config.sort){$$
	params.sort = ^^=config.sort$$;
  ^^}$$
	$scope["^^=config.name$$"] = new ui.displayTable($scope, params);
	$scope["^^=config.name$$"].fetchSaveQuerys();
	$scope["^^=config.name$$"].refresh();

^^
}
$$
^^local.loadFactory = function(config){$$
rootApp.run(function($templateCache) {
  $templateCache.put('image.html', '<img class="img-thumbnail" ng-src="{{params.imgurl}}" ng-click="cancel()">');
  $templateCache.put('confirm.html', '<p class="bg-danger">{{params.content}}</p><a class="btn btn-primary" ng-click="ok()">确认</a><a class="btn btn-default" ng-click="cancel()">取消</a>');
  $templateCache.put('info.html', '<div ng-repeat="item in params">{{item.key}}:{{item.val}}</div><a class="btn btn-default" ng-click="cancel()">关闭</a>');
});
rootApp.controller('ModalController', function($scope, $modalInstance, params) {
  $scope.params = params;
  $scope.ok = function(){
    $modalInstance.close();
  };
  $scope.cancel = function(){
    $modalInstance.dismiss('cancel');
  };
});
rootApp.factory("ui", function($uibModal, req, ^^=angularCtrlDeps.join(', ')$$){
	var methods = {};
	methods.convert2arr = function(json, asstring){
		var arr = [];
		if(!asstring)
			for(var key in json)
				arr.push({key: parseInt(key), val: json[key]});
		else
			for(var key in json)
				arr.push({key: key, val: json[key]});
		return arr;
	}
	methods.openImageModal = function(imgurl){
		$uibModal.open({
      templateUrl: 'image.html',
      controller: 'ModalController',
      size: 'lg',
			resolve: {
        params: function () {
          return {imgurl: imgurl};
        }
			}
		});
	}
	var cache = {};
	methods.getFormated = function(schema, id, fn){
		if(cache[schema + id]) return fn(cache[schema + id]);
		access.select(schema, id, function(err, doc){
			if(err) return alert("网络错误");
			var fmdoc = methods.convert2arr(doc, true);
			cache[schema + id] = fmdoc;
			fn(fmdoc);
		});
	}
	methods.openInfoModal = function(schema, id){
		methods.getFormated(schema, id, function(doc){
			$uibModal.open({
				templateUrl: 'info.html',
				controller: 'ModalController',
				size: 'md',
				resolve: {
					params: function () {
						return doc;
					}
				}
			});
		});
	}
	methods.openConfirmModal = function(content, submit){
		var modalInstance = $uibModal.open({
      templateUrl: 'confirm.html',
      controller: 'ModalController',
      size: 'sm',
			resolve: {
        params: function () {
          return {
						content: content
					};
        }
			}
		});
		modalInstance.result.then(function(){
			submit();
		});
	}
	methods.displayTable = function($scope, config) {
		this.$scope = $scope;
		this.showsave = false;
//		this.data = [];
		this.rawquerys = [];
		this.currPage = 1;
		this.totalPage = 0;
		this.perPage = 10; //the number of entries per page
		this.perPages = [5, 10, 20, 50, 100]; //the number of entries per page to select
		this.perScreen = 5; //the number of pages per screen
		this.api = config.api;
		var self = this;
		self.sort = config.sort || {};
		$scope.$watch(function() {
			return self.perPage;
		}, function(newv, oldv) {
			if (newv && oldv != newv) {
				self.currPage = 1;
				self.refresh();
			}
		});
		$scope.$watchCollection(function() {
			return self.sort;
		}, function(newv, oldv) {
			if (newv && oldv != newv) self.refresh();
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
		self.refs = config.refs;
		self.fields = config.fields;
		self.fieldlist = config.fieldlist;
		self.project = {};
		for(var f in self.fields){
			self.project[f] = 1;
		}
		self.oplist = ["=",">","<",">=","<=","!=","in","notin","match","exists","notexists", "clear"];
		self.addRawQuery =function(by){
			if(!by){
				self.rawquerys.push({op:"=", by: ""});
			}else{
				self.rawquerys.push({op:"=", by: by});
			}
		}
		self.formatRawQuery = function(){
			self.where = {};
			self.by = {};
			if(config.where)
				for(var key in config.where)
					self.where[key] = config.where[key];
			for(var qi in self.rawquerys){
				var rq = self.rawquerys[qi];
				var fields, where;
				if(rq.by) {
					fields = config.refs[rq.by].fields;
					if(!self.by[rq.by]) self.by[rq.by] = {where:{},field:config.refs[rq.by].field};
					where = self.by[rq.by].where;
				}else{
					fields = self.fields;
					where = self.where;
				}
				if(!fields[rq.field]){
					alert(rq.field + "不存在");
					return 1;
				}
				if(!rq.field) continue;
				if(rq.op == "exists"){
					where[rq.field] = {$exists: true};
					continue;
				}
				if(rq.op == "notexists"){
					where[rq.field] = {$exists: false};
					continue;
				}					
				if(rq.op == "clear"){
					delete where[rq.field];
					continue;
				}
				if(!rq.hasOwnProperty("v"+rq.by+rq.field)) continue;
				var value = rq["v"+rq.by+rq.field];
				var type = fields[rq.field].type;
				if(type == "string")
					value = value.toString();
				else if(type == "int"){
					if(fields[rq.field].money){
						value = parseInt(value*100);
					}else{
						value = parseInt(value);
					}
				}
				else if(type == "float")
					value = parseFloat(value);
				else if(type == "date")
					value = new Date(value);
				else if(type == "datetime")
					value = new Date(value);
				if(rq.op == "="){
					where[rq.field] = value;
					continue;
				}
				if(where[rq.field] == "="){
					alert("=不能与其他操作符共存: "+rq.field);
					return 1;
				}
				if(!where[rq.field]) where[rq.field] = {};
				if(rq.op == ">"){
					where[rq.field].$gt = value;
				}
				if(rq.op == ">="){
					where[rq.field].$gte = value;
				}
				if(rq.op == "<"){
					where[rq.field].$lt = value;
				}
				if(rq.op == "<="){
					where[rq.field].$lte = value;
				}
				if(rq.op == "!="){
					where[rq.field].$ne = value;
				}
				if(rq.op == "in"){
					where[rq.field].$in = JSON.parse(value);
				}
				if(rq.op == "notin"){
					where[rq.field].$nin = JSON.parse(value);
				}
				if(rq.op == "match"){
					where[rq.field].$regex = value;
				}
			}
		}
		self.loadSave = function(orisave){
			var save;
			if(!orisave) save = {};
			else save = angular.copy(orisave);
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
		self.refresh = function() {
			if(self.formatRawQuery()) return;
			req.postBearer("/api/access/"+ config.schema + "/bcolect", auth.gettoken(), {
				by: self.by,
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
		};
		self.showinsertrow = false;
		self.showupdaterow = false;
		self.new = {};
		self.hiderow = function(){
			self.showinsertrow = false;
			self.showupdaterow = false;
		}
		self.showadd = function(){
			if(self.showupdaterow) self.showupdaterow = false;
			self.showinsertrow = !self.showinsertrow;
			if(self.showinsertrow){				
				self.new = {};
			}
		};
		self.showupdate = function(row){
			if(self.showinsertrow) self.showinsertrow = false;
			self.showupdaterow = !self.showupdaterow;
			if(self.showupdaterow){
				for(var key in row){
					if(key.match('pass')) continue;
					self.new[key] = row[key];
				}
			}
		}

		self.upsert = function(){
			var row = self.new;
			var _id = row._id;
			if(!_id)
				access.insert(config.schema, row, function(){
					self.hiderow();
					self.refresh();
				});
			else{
				delete row._id;
				access.update(config.schema, _id, row, function(){
					self.hiderow();
					self.refresh();
				});
			}
		}
		self.showdelete = function(id){
			self.fields.showrow_id = true;
			methods.openConfirmModal("确定要删除"+id+"吗", function(){
				access.delete(config.schema, id);
				self.refresh();
			});
		}
	}
	return methods;
});
^^}$$
