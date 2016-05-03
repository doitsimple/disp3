var mongodb = require("mongodb");
var bcrypt = require("bcrypt");
module.exports.sync = 
function sync(fnarr, fn){
	var runner = {};
	runner.nexti = 0;
	runner.fnarr = fnarr;
	_sync(runner, fn);
}
function _sync(runner, fn){
	if(runner.fnarr.length == runner.nexti) {
		fn(null);
		return;
	}
	var func = runner.fnarr[runner.nexti];
	func(function(err, result){
		if(err){
			fn(err, runner.nexti);
			return;
		}
		runner.nexti += 1;
		_sync(runner, fn);
	});
}

;

module.exports.Database = 
/*
db.insert
db.select
db.update
db.delete
*/
function Database(methods){
	var self = this;
	var db;
	var internalMethods = {
		select: function(name, where, fn){
			getOp("selectx")(name, {$match: where, $limit:1}, function(err, result){
				fn(err, result[0]);
			});
		},
		selects: function(name, where, fn){
			getOp("selectx")(name, {$match: where}, fn);
		},
		update: function(name, where, doc, fn){
			getOp("updatex")(name, {$match: where, $set: doc, $limit: 1}, fn);
		},
		updates: function(name, where, doc, fn){
			getOp("updatex")(name, {$match: where, $set: doc}, fn);
		},
		upsert: function(name, where, doc, fn){
			getOp("upsertx")(name, {$match: where, $set: doc}, fn);
		},
		sedate: function(name, where, doc, fn){
			getOp("sedatex")(name, {$match: where, $set: doc, $limit: 1}, fn);
		},
		sedates: function(name, where, doc, fn){
			getOp("sedatex")(name, {$match: where, $set: doc}, fn);
		}
	}
	function _getOp(op){
		if(methods[op]) return methods[op];
		else return internalMethods[op];
	}
	function getOp(op){
		if(!db)
			return function(){
				var arg = arguments;
				var lastarg = arguments[arguments.length - 1];
				methods.connect(function(err, _db){
					if(err){
						if(typeof lastarg == "function") lastarg(err);
						return;
					}
					db = _db;
					formatArgs(op, arg);
					_getOp(op).apply(self, arg);
				});
			}
		else{
			return function(){
				var arg = arguments;
				formatArgs(op, arg);
				_getOp(op).apply(self, arg);				
			}
		}
	}
	function formatArgs(op, args){		
		if(methods.formatArgs) methods.formatArgs(op, args);
	}
	var opList = {
		insert: 2,
		select: 3,
		update: 3,
		delete: 3,
		sedate: 3,
		upsert: 3,
		colect: 3,
		aggr: 1,
		count: 1,
		each: 1,
		get: 1,
		set: 1,
		expire: 1
	};
	for(var key in opList){
		self[key] = getOp(key);
		if(opList[key] > 1)
			self[key+"s"] = getOp(key+"s");
		if(opList[key] > 2)
			self[key+"x"] = getOp(key+"x");
	}
	self.drop = getOp("drop");
}

;

module.exports.ObjectId = 
mongodb.ObjectId;
;

module.exports.isArray = 
function isArray(obj){
	return Object.prototype.toString.call( obj ) === '[object Array]';
}
;

module.exports.eachSync = 
function eachSync(arr, fneach, fn){
//each([0,1,2],function(el,cb){}, function(err){})
	var runner = {arr: arr, fneach: fneach, fn: fn};
	runner.nexti = 0;
	eachSyncSub(runner);
}
function eachSyncSub(runner){
	if(runner.nexti == runner.arr.length){
		runner.fn();
		return;
	}
	runner.fneach(runner.arr[runner.nexti], function(err){
		runner.nexti++;
		if(!err)
			eachSyncSub(runner);
		else
			runner.fn(err);
	});
}

;

module.exports.project = 
function project(src, config, target){
	if(!src) return;
	if(!target) target = {};
	for(var key in config){
		if(src[key] == undefined || src[key] == null) continue;
		if(typeof config[key] == "string"){
			target[config[key]] = src[key];
		}else{
			target[key] = src[key];
		}
	}
	return target;
}
;

module.exports.bcryptEncode = 
function bcryptEncode(str, saltnum) {
  if (!saltnum) saltnum = 5;
  var salt = bcrypt.genSaltSync(saltnum);
  return hash = bcrypt.hashSync(str, salt);
}

;

