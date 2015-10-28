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
function formatString(json, key){
	if(json.hasOwnProperty(key) && json[key] != undefined)
		if(typeof json[key] == "object"){
			for(var key2 in json[key]){
				if(typeof json[key][key2] != "object")
					try{						
						json[key][key2] = json[key][key2].toString();
					}catch(e){
						log.i(json[key][key2]);
						log.e(e);						
					}
			}
		}else{
			json[key] = json[key].toString();
		}
}
function formatInt(json, key){
	if(json.hasOwnProperty(key) && json[key] != undefined)
		if(typeof json[key] != "object"){
			json[key] = parseInt(json[key].toString());
		}
}
function formatFloat(json, key){
	if(json.hasOwnProperty(key) && json[key] != undefined)
		if(typeof json[key] != "object"){
			json[key] = parseFloat(json[key].toString());
		}
}
function formatDate(json, key){
	var val;
	if(json.hasOwnProperty(key) && json[key] != undefined)
		if(typeof json[key] == "object" && Object.keys(json[key]).length){
			for(var key2 in json[key]){
				if(typeof json[key][key2] == "string" && json[key][key2].length == 8){
				}else{
					val = libDate.getDate(new Date(json[key][key2]));
					if(val)
						json[key][key2] = val;
					else
						log.e("formatDate Error "+json[key][key2]);
				}
			}
		}else{
			if(json[key].length != 8){
				val = libDate.getDate(new Date(json[key]));
				if(val)
					json[key] = val;
				else
					log.e("formatDate Error "+json[key]);
			}
		}
}
function formatDatetime(json, key){
	if(json.hasOwnProperty(key) && json[key] != undefined)
		if(typeof json[key] == "object" && Object.keys(json[key]).length){
			for(var key2 in json[key]){		
				json[key][key2] = new Date(json[key][key2]);
			}
		}else{
			json[key] = new Date(json[key].toString());
		}

}

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
schemas["^^=schema.name$$"].formatUpdateDoc = function(json){
  ^^for(var fieldname in schema.fields){var field = schema.fields[fieldname];$$
   ^^if(!field.setonmodify) continue;$$
	 ^^if(field.hasOwnProperty("default")){$$
		if(!json.hasOwnProperty("^^=field.name$$"))
		^^if(field.type == "datetime"){var t = parseInt(field.default) || 0;$$
    	json["^^=field.name$$"] = new Date(new Date().getTime()+^^=t$$);
		^^}else if(field.type == "date"){var t = parseInt(field.default) || 0;$$
    	json["^^=field.name$$"] = libDate.getDate(new Date(new Date().getTime()+^^=t$$));
    ^^}else{$$
			json["^^=field.name$$"] = ^^=JSON.stringify(field.default)$$;
    ^^}$$
	 ^^}$$
	^^}$$
	if(schemas["^^=schema.name$$"].formatUpdateDocSpec) schemas["^^=schema.name$$"].formatUpdateDocSpec(json);
}
schemas["^^=schema.name$$"].formatDoc = function(json){
  ^^for(var fieldname in schema.fields){var field = schema.fields[fieldname];$$
 	 ^^if(field.type == "string"){$$
		formatString(json, "^^=field.name$$");
   ^^}else if(field.type == "int"){$$
		formatInt(json, "^^=field.name$$");
   ^^}else if(field.type == "float"){$$
 		formatFloat(json, "^^=field.name$$");
   ^^}else if(field.type == "date"){$$
 		formatDate(json, "^^=field.name$$");
   ^^}else if(field.type == "datetime"){$$
 		formatDatetime(json, "^^=field.name$$");
	 ^^}$$
	 ^^if(field.encrypt){$$
	if(json.hasOwnProperty("^^=field.name$$"))
    ^^if(!field.encryptParams){$$
		json["^^=field.name$$"] = libEncrypt["^^=field.encrypt$$"](json["^^=field.name$$"]);
    ^^}else{$$
		json["^^=field.name$$"] = libEncrypt["^^=field.encrypt$$"](json["^^=field.name$$"], ^^=field.encryptParams.join(",")$$);
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
		return log.e("wrong args"); 
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
function parseArgs(schema, args, notformat){
	var pargs = {};
	if(args.length == 3){
		pargs.where = args[0] || {};
		pargs.options = args[1] || {};
		if(args[2]){
			if(typeof args[2] != "function") {
				log.i("callback is not function!"); 
				log.e(args[2]); 
				pargs.callback = function(){};		
			}else{
				pargs.callback = args[2];
			}
		}else{
			pargs.callback = function(){};
		}
	}else if(args.length == 2){
		pargs.where = args[0] || {};
		if(typeof args[1] == "function"){
			pargs.options = {};
			pargs.callback = args[1];
		}else{
			pargs.options = args[1] || {};
			pargs.callback = function(){};
		}
	}else if(args.length == 1){
		if(typeof args[0] == "function"){
			pargs.where = {};
			pargs.options = {};
			pargs.callback = args[0];
		}else{
			pargs.where = args[0] || {};
			pargs.options = {};
			pargs.callback = function(){};
		}
	}else{
		log.e("args error");
		return;
	}
	if(schema.formatDoc && !notformat)
		schema.formatDoc(pargs.where);
	return pargs;
}
function formatInsertArgs(schema, args){
	if(schema.formatInsertDoc)
		schema.formatInsertDoc(args.where);
}
function formatUpdateArgs(schema, args){
	if(!args.options.$set) args.options.$set = {};
	if(schema.formatDoc){
		schema.formatDoc(args.options.$set);
	}
	if(schema.formatUpdateDoc){
		schema.formatUpdateDoc(args.options.$set);
	}
}
function formatUpsertArgs(schema, args){
	formatUpdateArgs(schema, args);
	if(!args.options.$setOnInsert) args.options.$setOnInsert = {};
	if(schema.formatInsertDoc)
		schema.formatInsertDoc(args.options.$setOnInsert);
	for(var key in args.options.$inc){
		delete args.options.$setOnInsert[key];
	}
	for(var key in args.options.$set){
		delete args.options.$setOnInsert[key];
	}
}
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
				var args = parseArgs(schema, arguments);
				model.bselect(args.where, args.options, args.callback);
			},
			insert: function(){
				var args = parseArgs(schema, arguments);
				if(!args.where) return args.callback("no doc");
				formatInsertArgs(schema, args);
				model.insert(args.where, function(err, result){
					if(err) return args.callback(err);
					return args.callback(null, {insertedId: result.insertedId});
				});
			},
			delete: function(){
				var args = parseArgs(schema, arguments);
				model.delete(args.where, args.callback);
			},
			update2: function(){
				var args = parseArgs(schema, arguments);
				formatUpdateArgs(schema, args);
				model.update2(args.where, args.options, args.callback);
			},
			upsert2: function(){
				var args = parseArgs(schema, arguments);
				formatUpsertArgs(schema, args);
				model.upsert2(args.where, args.options, args.callback);
			},
			sedate2: function(){
				var args = parseArgs(schema, arguments);
				formatUpdateArgs(schema, args);
				model.sedate2(args.where, args.options, args.callback);
			},
			count: function(){
				var args = parseArgs(schema, arguments);
				model.count(args.where, {}, args.callback);
			}
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

		if(model.select){
			std.select = function(){
				var args = parseArgs(schema, arguments);
				model.select(args.where, args.options, args.callback);
			}
		}else{
			std.select = function(){
				var args = parseArgs(schema, arguments);
				std.bselect(args.where, {$limit: 1}, function(err, docs){
					if(err) return args.callback(err);
					args.callback(undefined, docs[0]);
				});
			}
		}
		if(model.binsert) std.binsert = function(){
			var args = parseArgs(schema, arguments, 1);
			if(schema.formatInsertDoc)
				args.where.forEach(function(doc){
					schema.formatDoc(doc);
					schema.formatInsertDoc(doc);
				});
			model.binsert(args.where, args.callback);
		};
		if(model.bdelete) std.bdelete = function(){
			var args = parseArgs(schema, arguments);
			model.bdelete(args.where, args.callback);
		}
		if(model.bupdate2) {
			std.bupdate2 = function(){
				var args = parseArgs(schema, arguments);
				formatUpdateArgs(schema, args);
				model.bupdate2(args.where, args.options, args.callback);
			}
			std.bupdate = function(where, doc, cb){
				std.bupdate2(where, {$set: doc}, cb);
			}
		}
		if(model.bsedate2) {
			std.bsedate2 = function(){
				var args = parseArgs(schema, arguments);
				formatUpdateArgs(schema, args);
				model.bsedate2(args.where, args.options, args.callback);
			}
			std.bsedate = function(where, doc, cb){
				std.bsedate2(where, {$set: doc}, cb);
			}
		}

		std.bcolect = function(){
			var args = parseArgs(schema, arguments);				
			model.count(args.where, function(err, count){
				if(err) return args.callback(err);
				model.bselect(args.where, args.options, function(err, data){
					if(err) return args.callback(err);
					args.callback(err, {
						data: data,
						count: count
					});
				});
			});
		}
		if(model.each) std.each = model.each;
/*
		if(model.leftjoin) std.leftjoin = model.leftjoin;
		else if(std.each) std.leftjoin = function(rschema, key, left, right, fn){
			var rtn = {};
			if(!left) left = function(doc) {return doc;};
			if(!right) right = function(doc) {return doc;};
			std.each(function(err, doc){
				if(err) return fn(err);
				if(left(doc))
					rtn[doc[key]] = doc;
			}, function(){
				getModel(rschema).each(function(err, doc){
					if(err) return fn(err);
					if(rtn[doc[key]] && right(doc))
						for(var dkey in doc){
							if(dkey != key)
								rtn[doc[key]][dkey] = doc[dkey];
						}
				}, function(){
					fn(null, rtn);
				});
			});
		};
*/
		modelCache[schemaname] = std;		

	}
	return modelCache[schemaname];
}
