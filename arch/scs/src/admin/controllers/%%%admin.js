var db = require("../db");
module.exports.access = function(schema, method, body, admin, fn){
	if(body.by){
		db.getModel(body.by).select(body.where, function(err, doc){
			if(err) return fn(err);
			var json = {};
			json[body.by + "id"] = doc._id;
			db.getModel(schema)[method](json, fn);
		});
	}else{
		db.getModel(schema)[method](body.where, body.options, fn);
	}
}
