var mongodb = require("mongodb");
var MongoClient = require('mongodb').MongoClient;
var log = require("../lib/log");

var db;
var schemas = {};
/*^^for(var si=0; si<withSchemas.length;si++){var schema = global.proto.schemas[withSchemas[si]];$$*/
schemas["^^=schema.name$$"] = {};
^^if(schema.fields._id && schema.fields._id.autoinc){$$
schemas["^^=schema.name$$"].autoinc = "^^=schema.fields._id.autoinc$$";
^^}$$
schemas["^^=schema.name$$"].formatDoc = function(json){
	/*^^for(var fieldname in schema.fields){var field = schema.fields[fieldname];$$*/
	 ^^if(field.type == "ObjectId"){$$
	if(json.hasOwnProperty("^^=field.name$$")){
		try{
			json["^^=field.name$$"] = new mongodb.ObjectId(json["^^=field.name$$"]);
		}catch(e){
			log.e(e);
		}
	  if(!json["^^=field.name$$"])
			delete json["^^=field.name$$"]
	}
   ^^}$$
	/*^^}$$*/
}
/*^^}$$*/
module.exports.schemas = schemas;
module.exports.connect = connect;
function connect(env, cb){
^^
	if(!local.host) host = "127.0.0.1";
	if(!local.port) port = 27017;
	if(local.username && local.password) authStr = username + ":" + password + "@";
	else authStr = "";
	hostStr =  authStr + host + ":" + port + "/" + db;
$$
	var url = 'mongodb://^^=hostStr$$';
	if(!db)
		MongoClient.connect(url, function(err, client) {
			module.exports.client = client;
			db = client;
			cb(err);
		});
	else
		cb(null);

};
module.exports.getModel = getModel;
function getModel(cname){
	var model = function(){};
	var origin = db.collection(cname);
	model.origin = origin;
	model.name = cname;
	/*
	 criteria: 
	 $or,$and,$nor: [exp]
	 exp:
	 field: $not:exp,$gt,$lt,$gte,$lte,$eq,$ne,$exists,$in,$nin

	 */
	
	model.insert = function(doc, fn){
		//fn: function(err, result)
		//result: {insertedId: "abcdedf"}
		origin.insertOne(doc, fn);
	};
	model.binsert = function(docs, fn){
		//fn: function(err, result)
		//result: {n: 10}
		origin.insertMany(docs, fn);
	};
	model.upsert2 = function(criteria, updateParam, fn){
		origin.updateOne(criteria, updateParam, {upsert:true}, function(err, result){
			var rtn;
			if(result) rtn = result.result;
			else rtn = {n: 0};
			if(fn) fn(err, rtn);
		});
	};
	model.sui = function(criteria, doc, fn){
		var doc2 = {$set: doc};
		if((fdoc[cname])){
			doc2.$setOnInsert = {};
			fdoc[cname](doc, doc2.$setOnInsert);
		}
		origin.findAndModify(criteria, [], doc2, {upsert: true}, function(err, doc){
			if(err) return fn(err);
			if(!doc) return fn(null, doc);
			if(fn) fn(err, doc.value);
		});
	};
	model.sui2 = function(criteria, updateParam, fn){
		var updateParam2 = updateParam;
		if((fdoc[cname])){
			updateParam2.$setOnInsert = {};
			fdoc[cname](updateParam, updateParam2.$setOnInsert);
		}
		origin.findAndModify(criteria, [], updateParam2, {upsert: true}, function(err, doc){
			if(err) return fn(err);
			if(!doc) return fn(null, doc);
			if(fn) fn(err, doc.value);
		});
	};
	if(schemas[cname] && schemas[cname].autoinc){
		model.insertori = model.insert;
		model.binsertori = model.binsert; delete model.binsert; 
		model.upsertori = model.upsert;
		model.upsert2ori = model.upsert2; delete model.upsert2;
		model.suiori = model.sui; delete model.sui;
		model.sui2ori = model.sui2; delete model.sui2;
		model.insert = function(doc, fn){
			db.collection(schemas[cname].autoinc).findAndModify({}, [], {$inc: {last:1}}, {new: true, upsert: true}, function(err, result){
				doc._id = result.value.last;
				model.insertori(doc, fn);
			})
		}
		model.upsert = function(criteria, doc, fn){
			db.collection(schemas[cname].autoinc).findAndModify({}, [], {$inc: {last:1}}, {new: true, upsert: true}, function(err, result){
				doc._id = result.value.last;
				model.insertori(doc, fn);
			})
		}
	}
	model.update = function(criteria, doc, fn){
		//fn: function(err, result)
		//result: {n: 1}
		delete doc._id;
		origin.updateOne(criteria, {$set: doc}, function(err, result){
			var rtn;
			if(result) rtn = result.result;
			else rtn = {n: 0};
			if(fn) fn(err, rtn);
		});
	};
	model.update2 = function(criteria, updateParam, fn){
		origin.updateOne(criteria, updateParam, function(err, result){
			var rtn;
			if(result) rtn = result.result;
			else rtn = {n: 0};
			if(fn) fn(err, rtn);
		});
	};
	model.delete = function(criteria, fn){
		//fn: function(err, result)
		//result: {n: 1}
		if(!criteria) return fn("no criteria");
		origin.deleteOne(criteria, fn);
	};
	model.select = function(criteria, fn){
		//fn: function(err, result)
		//result: doc
		origin.findOne(criteria, fn);
	};
	model.bupdate = function(criteria, doc, fn){
		origin.updateMany(criteria, {$set: doc}, function(err, result){
			var rtn;
			if(result) rtn = result.result;
			else rtn = {n: 0};
			if(fn) fn(err, rtn);
		});
	};
	model.bdelete = function(criteria, fn){
		origin.deleteMany(criteria, function(err, result){
			if(err) return fn(err);
			if(result.result) fn(null, result.result);
			else fn(null, {n:0});
		});
	};
	model.bselect = function(criteria, selectOptions, fn){
		if(!fn){
			fn = selectOptions; 
			selectOptions = {};
		};
		var aggrarr = [{$match: criteria}];
		if(selectOptions.$sort && Object.keys(selectOptions.$sort).length>0)
			aggrarr.push({$sort: selectOptions.$sort});
		if(selectOptions.$skip)
			aggrarr.push({$skip: parseInt(selectOptions.$skip)});
		if(selectOptions.$limit)
			aggrarr.push({$limit: parseInt(selectOptions.$limit)});
		if(selectOptions.$project && Object.keys(selectOptions.$project).length>0)
			aggrarr.push({$project: selectOptions.$project});
		origin.aggregate(aggrarr, fn);
	};
	model.count = function(criteria, fn){
		origin.count(criteria, fn);
	};
	model.bcolect = function(criteria, selectOptions, fn){
		if(!fn){
			fn = selectOptions; 
			selectOptions = {};
		};
		model.count(criteria, function(err, count){
			if(err) return fn(err);
			model.bselect(criteria, selectOptions, function(err, data){
				if(err) return fn(err);
				fn(err, {
					data: data,
					count: count
				});
			});
		});
	};
	model.bupdate2 = function(criteria, updateParam, fn){
		origin.updateMany(criteria, updateParam, function(err, result){
			var rtn;
			if(result) rtn = result.result;
			else rtn = {n: 0};
			if(fn) fn(err, rtn);
		});
	};
	model.sedate = function(criteria, doc, fn){
		origin.findAndModify(criteria, [], {$set: doc}, function(err, doc){
			if(err) return fn(err);
			if(!doc) return fn(null, doc);
			if(fn) fn(err, doc.value);
		});
	};
	model.sedate2 = function(criteria, updateParam, fn){
		origin.findAndModify(criteria, [], updateParam, function(err, doc){
			if(err) return fn(err);
			if(!doc) return fn(null, doc);
			if(fn) fn(err, doc.value);
		});
	};
	/*[{a:1},{a:1},{a:2},{a:3}] distinct a:[1,2,3]*/
	model.distinct = function(criteria, fn){
		origin.distinct(criteria, fn);
	};
	model.group = function(criteria, groupOptions, fn){
		var aggr;
		if(!fn){
			aggr = [{$group:criteria}];
			fn = groupOptions;
		}else{
			aggr = [{$match: criteria},{$group:groupOptions}];
		}
		origin.aggregate(aggr, fn);
	};
	return model;
}

