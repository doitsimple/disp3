var db = require("../db");
var sync = require("../lib/sync");
var log = require("../lib/log");
function validate(schema, method, project, admin, config){
	var pass = 0;
	for(var key in admin){
		if(!config[key]) continue;
		var c = config[key];
		if(c.all){
			pass = 1;
			break;
		}
		if(!c.schemas){
			log.e("not schema for config");
			continue;
		}
		if(c.schemas[schema]){
			var s = c.schemas[schema];
			if(s.all) pass = 1;
			if(project &&
				(method == "select" || method == "bselect" || method =="bcolect")){
				if(s.noproject)
					for(var pkey in s.noproject)
						delete project[pkey];
				if(s.project){
					for(var pkey in project)
						delete project[pkey];
					for(var pkey in s.project)
						project[pkey] = s.project[pkey];
				}
			}
			if(s.methods){
				if(s.methods[method])
					pass = 1;
			}
		}
	}
	return pass;
}

module.exports.access = function(schema, method, body, admin, fn){
	var project = {};
	if(method == "select" || method == "bselect" || method =="bcolect"){
		if(!body.options) body.options = {};
		if(!body.options.$project) body.options.$project = {};
		project = body.options.$project;
	}
	if(!auth(schema, method, project, admin))
		 return fn("无操作权限");
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
