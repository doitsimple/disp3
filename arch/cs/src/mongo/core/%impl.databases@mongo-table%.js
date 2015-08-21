var mongodb = require("mongodb");
var MongoClient = require('mongodb').MongoClient;
var log = require("./log");

var db;
var fdoc = {};
var init = {};
var autoinc = {};
/*^^for(var si=0; si<withSchemas.length;si++){var schema = global.proto.schemas[withSchemas[si]];$$*/
^^if(schema.fields._id.autoinc){$$
autoinc["^^=schema.name$$"] = "^^=schema.fields._id.autoinc$$";
^^}$$
init["^^=schema.name$$"] = function(db){
}
fdoc["^^=schema.name$$"] = function(olddoc, newdoc){
	var doc = newdoc?newdoc:olddoc;
	if(newdoc){
		for(var key in olddoc){
			if(key[0] != "$"){
				newdoc[key] = olddoc[key];
			}
		}
	}
	/*^^for(var fieldname in schema.fields){var field = schema.fields[fieldname];$$*/
	/*^^if(field.hasOwnProperty("default")){$$*/
	if(!olddoc.hasOwnProperty("^^=field.name$$"))
		^^if(field.type == "datetime"){var t = parseInt(field.default) || 0;$$
		doc["^^=field.name$$"] = new Date(new Date().getTime()+^^=t$$);
		^^}else{$$
		doc["^^=field.name$$"] = ^^=JSON.stringify(field.default)$$
		^^}$$
  /*^^}$$*/
	/*^^}$$*/
}
/*^^}$$*/

module.exports = function(dbnameMap, genModelFuncList, connectFuncs){
	/*^^for(var si=0; si<withSchemas.length;si++){$$*/
	dbnameMap["^^=withSchemas[si]$$"] = "^^=name$$";
	/*^^}$$*/
	
	genModelFuncList["^^=name$$"] = getModel;
	genModelFuncList["mongo"] = getModel;
	connectFuncs.push(connect);
	return {
		ObjectId: mongodb.ObjectId
	}
}
function connect(env, cb){
	var url = 'mongodb://^^=host$$';
	if(!db)
		MongoClient.connect(url, function(err, client) {
			module.exports.client = client;
			db = client;
			/*^^for(var si=0; si<withSchemas.length;si++){$$*/
			init["^^=withSchemas[si]$$"](db);
			/*^^}$$*/
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
		if(!doc) return fn("no doc");
		if(fdoc[cname]) fdoc[cname](doc);
		origin.insertOne(doc, fn);
	};
	model.binsert = function(docs, fn){
		//fn: function(err, result)
		//result: {n: 10}
		if((fdoc[cname]))
			docs.forEach(function(doc){
				fdoc[cname](doc);
			});
		origin.insertMany(docs, fn);
	};
	model.upsert = function(criteria, doc, fn){
		var doc2 = {$set: doc};
		if((fdoc[cname])){
			doc2.$setOnInsert = {};
			fdoc[cname](doc, doc2.$setOnInsert);
		}
		origin.updateOne(criteria, doc2, {upsert:true}, function(err, result){
			var rtn;
			if(result) rtn = result.result;
			else rtn = {n: 0};
			if(fn) fn(err, rtn);
		});
	};
	model.upsert2 = function(criteria, updateParam, fn){
		var updateParam2 = updateParam;
		if((fdoc[cname])){
			updateParam2.$setOnInsert = {};
			fdoc[cname](updateParam, updateParam2.$setOnInsert);
		}
		origin.updateOne(criteria, updateParam2, {upsert:true}, function(err, result){
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
	if(autoinc[cname]){
		model.insertori = model.insert;
		model.binsertori = model.binsert; delete model.binsert; 
		model.upsertori = model.upsert;
		model.upsert2ori = model.upsert2; delete model.upsert2;
		model.suiori = model.sui; delete model.sui;
		model.sui2ori = model.sui2; delete model.sui2;
		model.insert = function(doc, fn){
			db.collection(autoinc[cname]).findAndModify({}, [], {$inc: {last:1}}, {new: true, upsert: true}, function(err, result){
				doc._id = result.value.last;
				model.insertori(doc, fn);
			})
		}
		model.upsert = function(criteria, doc, fn){
			db.collection(autoinc[cname]).findAndModify({}, [], {$inc: {last:1}}, {new: true, upsert: true}, function(err, result){
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
		if(!criteria){
			fn = criteria;
			criteria = {};
		}
		origin.deleteMany(criteria, fn);
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

