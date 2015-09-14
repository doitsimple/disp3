var sync = require("../lib/sync");
var log = require("../lib/log");
var libDate = require("../lib/date");
var libObject = require("../lib/object");
var libEncrypt = require("../lib/encrypt");
var modelCache = {};
var dbs = {};
var schemas = {};

var dbnameMap = {};
var genModelFuncList = {};
var connectFuncs = [];
var initFuncs = [];
^^var maindbname; 
 for(var dbname in global.impl.databases){
  var db=global.impl.databases[dbname];
	if(db.model != "table") continue;
  if(!maindbname) maindbname = dbname;
$$
dbs["^^=dbname$$"] = require("./^^=dbname$$");
dbs["^^=dbname$$"].initSchemas = function(){
 ^^for(var i in db.withSchemas){var schema = global.proto.schemas[db.withSchemas[i]];$$
if(schemas["^^=schema.name$$"]) log.e("same schema for two db");
schemas["^^=schema.name$$"] = {};
for(var key in dbs["^^=dbname$$"].schemas["^^=schema.name$$"]){
	schemas["^^=schema.name$$"][key+"Spec"] = dbs["^^=dbname$$"].schemas["^^=schema.name$$"][key];
}
schemas["^^=schema.name$$"].db = "^^=dbname$$";

schemas["^^=schema.name$$"].formatDoc = function(json){
  ^^for(var fieldname in schema.fields){var field = schema.fields[fieldname];$$
	 ^^if(field.type == "string"){$$
	if(json.hasOwnProperty("^^=field.name$$")) 
		json["^^=field.name$$"] = json["^^=field.name$$"].toString();
   ^^}else if(field.type == "int"){$$
	if(json.hasOwnProperty("^^=field.name$$")) 
		json["^^=field.name$$"] = parseInt(json["^^=field.name$$"]);
   ^^}else if(field.type == "float"){$$
	if(json.hasOwnProperty("^^=field.name$$")) 
		json["^^=field.name$$"] = parseFloat(json["^^=field.name$$"]);
   ^^}else if(field.type == "date"){$$
	if(json.hasOwnProperty("^^=field.name$$")) 
		json["^^=field.name$$"] = libDate.getSimple(new Date(json["^^=field.name$$"]));
   ^^}else if(field.type == "datetime"){$$
	if(json.hasOwnProperty("^^=field.name$$"))
		json["^^=field.name$$"] = new Date(json["^^=field.name$$"]);
	 ^^}$$
	 ^^if(field.encrypt){$$
	if(json.hasOwnProperty("^^=field.name$$"))
    ^^if(!field.encryptParams){$$
		json["^^=field.name$$"] = libEncrypt["^^=field.encrypt$$"](json["^^=field.name$$"]);
    ^^}else{$$
		json["^^=field.name$$"] = libEncrypt["^^=field.encrypt$$"](json["^^=field.name$$"], ^^=encryptParams.join(",")$$);
	  ^^}$$
	 ^^}$$
	^^}$$
	if(schemas["^^=schema.name$$"].formatDocSpec) schemas["^^=schema.name$$"].formatDocSpec(json);
}
schemas["^^=schema.name$$"].formatInsertDoc = function(json){
  ^^for(var fieldname in schema.fields){var field = schema.fields[fieldname];$$
	 ^^if(field.hasOwnProperty("default")){$$
		if(!json.hasOwnProperty("^^=field.name$$"))
		^^if(field.type == "datetime"){var t = parseInt(field.default) || 0;$$
    	json["^^=field.name$$"] = new Date(new Date().getTime()+^^=t$$);
		^^}else if(field.type == "date"){var t = parseInt(field.default) || 0;$$
    	json["^^=field.name$$"] = libDate.getSimple(new Date(new Date().getTime()+^^=t$$));
    ^^}else{$$
			json["^^=field.name$$"] = ^^=JSON.stringify(field.default)$$;
    ^^}$$
	 ^^}$$
	^^}$$
	if(schemas["^^=schema.name$$"].formatInsertDocSpec) schemas["^^=schema.name$$"].formatInsertDocSpec(json);
	schemas["^^=schema.name$$"].formatDoc(json);
};
	^^if(schema.init && schema.init.length){schema.seed = schema.init;console.log("schema init depleted, please change to seed");}$$
	^^if(schema.seed && schema.seed.length){$$
schemas["^^=schema.name$$"].seed = function(env, cb){
	getModel("^^=schema.name$$").select({}, function(err, doc){
		if(!err && !doc)
			getModel("^^=schema.name$$").binsert(^^=JSON.stringify(schema.seed)$$, cb);
		else
			cb();
	});
};
	^^}$$
 ^^}$$
}
^^}$$

var isConnected = false;
module.exports.connect = function (){
	var filter, cb;
	if(arguments.length  == 1){
		cb = arguments[0];
		filter = [];
	}else if(arguments.length == 2){
		if(typeof arguments[0] == "object")
			filter = arguments[0];
		else
			filter = [arguments[0]];
		cb = arguments[1];
	}else{
		return log.e("wrong args "+arguments.join(",")); 
	}
	if(isConnected){
		log.w("connect twice");
		return cb();
	}

	var fdbs = {};
	for(var fi in filter){
		var f = filter[fi];
		if(!dbs[f]) return log.e("filter " + f + " not exist");
		fdbs[f] = dbs[f];
	};
	if(!filter.length) fdbs = dbs;
	sync.doKeySeries(fdbs, "connect", function(err){
		if(err) return cb(err);
		for(var key in fdbs)
			fdbs[key].initSchemas();
		isConnected = true;
		sync.doKeySeries(schemas, "seed", function(err){
			if(err) return cb(err);
			cb();
		});
	});
};
module.exports.getModel = getModel;
function getModel(schemaname){
	if(!isConnected) return log.e("not connected");
	if(!modelCache[schemaname]){
		var schema = schemas[schemaname];
		var dbname;
		if(schema && schema.db)
		 dbname = schema.db;
		if(!dbname){
			dbname = "^^=maindbname$$";
			log.i(schemaname + " not assign to database, assign to " + dbname);
			schema = {};
		}
		var db = dbs[dbname];
		var model = db.getModel(schemaname);
		var std = {
			origin: model.origin,
			bselect: function(){
				var where, op, cb;
				if(arguments.length == 2){
					where = arguments[0];
					op = {};
					cb = arguments[1];
				}else if(arguments.length == 3){
					where = arguments[0];
					op = arguments[1];
					cb = arguments[2];
				}else{
					return log.e("wrong args for bselect " + arguments.join(","));
				}
				if(schema.formatDoc)
					schema.formatDoc(where);
				model.bselect(where, op, cb);
			},
			insert: function(doc, cb){
				if(!doc) return cb("no doc");
				if(schema.formatInsertDoc)
					schema.formatInsertDoc(doc);
				model.insert(doc, cb);
			},
			delete: model.delete,
			update2: model.update2,
			upsert2: function(where, doc, cb){
				if(!doc.$setOnInsert) doc.$setOnInsert = {};
				if(schema.formatInsertDoc)
					schema.formatInsertDoc(doc.$setOnInsert);
				if(schema.formatDoc)
					schema.formatDoc(doc.$set);
				for(var key in doc.$inc){
					delete doc.$setOnInsert[key];
				}
				model.upsert2(where, doc, cb);
			},
			sedate2: model.sedate2,
			count: model.count
		}
		std.update = function(where, doc, cb){
			std.update2(where, {$set: doc}, cb);
		}
		std.upsert = function(where, doc, cb){
			std.upsert2(where, {$set: doc}, cb);
		}
		std.sedate = function(where, doc, cb){
			std.sedate2(where, {$set: doc}, cb);
		}

		if(model.select) std.select = function(where, cb){
			if(schema.formatDoc)
				schema.formatDoc(where);
			model.select(where, cb);
		}
		if(model.binsert) std.binsert = function(docs, cb){
			if(schema.formatInsertDoc)
				docs.forEach(function(doc){
					schema.formatInsertDoc(doc);
				});
			model.binsert(docs, cb);
		};
		if(model.bdelete) std.bdelete = model.bdelete;

		if(model.bupdate) std.bupdate = model.bupdate;
		if(model.bupdate2) std.bupdate2 = model.bupdate2;
		if(model.bsedate) std.bsedate = model.bsedate;
		if(model.bsedate2) std.bsedate2 = model.bsedate2;

		std.bcolect = function(){
			var where, op, cb;
			if(arguments.length == 2){
				where = arguments[0];
				op = {};
				cb = arguments[1];
			}else if(arguments.length == 3){
				where = arguments[0];
				op = arguments[1];
				cb = arguments[2];
			}else{
				return log.e("wrong args for bcolect " + arguments.join(","));
			}
				
			model.count(where, function(err, count){
				if(err) return cb(err);
				model.bselect(where, op, function(err, data){
					if(err) return cb(err);
					cb(err, {
						data: data,
						count: count
					});
				});
			});
		}
		modelCache[schemaname] = std;		

	}
	return modelCache[schemaname];
}
