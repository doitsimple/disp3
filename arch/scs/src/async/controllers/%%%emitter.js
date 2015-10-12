var db = require("../db");
var log = require("../lib/log");
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
/*
status
1 begin
2 wait 
3 finish 

*/
module.exports = Emitter;
function Emitter(name){
	var self= this;
	self.name = name;
	function createEmitter(_id, doc, asyncfn, fn){
		var Model = db.getModel(self.name+"_emitter");
		emitter.once(_id, function(params){
			if(params.error){
				Model.update({
					_id: _id
				}, params, function(err){
					if(err) log.e(err);
					fn(params.error);
				});
				return;
			}
			if(!asyncfn)
				asyncfn = require("../controllers/"+ doc.file)[doc.method];
			asyncfn(doc, function(err, result){
				if(err){
					Model.update({_id: _id}, {
						status: 3,
						error: err
					});
					return fn(err);
				}
				Model.update({_id: _id}, {status: 3}, function(err){
					if(err) return fn(err);
					fn(null, result);
				});
			});
		})
	}
	self.pause = function(fn){
		fn();
	}
	self.recover = function(fn){
		db.getModel(self.name+"_emitter").each(function(err, doc){
			if(err) return log.e(err);
			if(doc.status == 2){
				createEmitter(doc._id.toString(), doc, null, function(err){
					if(err) return log.e(err);
				});
			}
		}, fn);
	}
	self.start = function(doc, prefn, asyncfn, fn){
		if(doc._id) return fn("must not have id");
		var Model = db.getModel(self.name + "_emitter");
		if(!doc.file || !doc.method) return fn("no file or method");
		try{
			var func = require("../controllers/"+ doc.file)[doc.method];
			if(typeof func != "function") 
				return fn(doc.method + " is not a function");
		}catch(e){
			return fn("file or method error " + doc.file + "." + doc.method);
		}
		Model.insert(doc, function(err, result){
			if(err) return fn(err);
			var _id = result.insertedId.toString();
			doc.asyncid = _id;
			createEmitter(_id, doc, asyncfn, fn);
			prefn(doc, function(err){
				if(err){
					self.finish(_id, {
						error: err
					});
					return;
				}
				Model.update({
					_id: _id
				}, {status: 2}, function(err2){
					if(err2) log.e(err2);
					//now wait other to call finish 
				});
			});
		});
	};
	self.finish = function(_id, params){
		emitter.emit(_id, params);
	}
}
