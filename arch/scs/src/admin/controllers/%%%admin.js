var db = require("../db");
var sync = require("../lib/sync");
module.exports.access = function(schema, method, body, admin, fn){
	if(body.by && Object.keys(body.by).length > 0){
		sync.each(Object.keys(body.by), function(schema, cb){
			var byconfig = body.by[schema];
			db.getModel(schema).bselect(byconfig.where, function(err, docs){
				if(err) return cb(err);
				if(!docs.length){
					cb("returned");
					return fn(null, []);
				}
				if(docs.length > 20){
					return cb("对应"+schema+"表数据超过20条");
				}
				body.where[byconfig.field] = {$in: []};
				for(var i in docs){
					body.where[byconfig.field].$in.push(docs[i]._id);
				}
				cb();
			});
		}, function(err){
			if(err == "returned") return;
			if(err) return fn(err);
			db.getModel(schema)[method](body.where, body.options, fn);
		});
	}else{
		db.getModel(schema)[method](body.where, body.options, fn);
	}
}

