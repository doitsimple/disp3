var mongodb = require("mongodb");
var MongoClient = require('mongodb').MongoClient;
var log = require("./log");

var db;
var modelCache = {};
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
			/*

			 */
			cb(err);
		});
	else
		cb(null);

};
module.exports.getModel = getModel;
function getModel(cname){
	var model = {};
	var origin = db.collection(cname);
	model.origin = origin;
	/*
	 criteria: 
	 $or,$and,$nor: [exp]
	 exp:
	 field: $not:exp,$gt,$lt,$gte,$lte,$eq,$ne,$exists,$in,$nin

	 */
	model.insert = function(doc, fn){
		if(!doc) return fn("no doc");
		origin.insertOne(doc, fn);
	};
	model.update = function(criteria, doc, fn){
		origin.updateOne(criteria, {$set: doc}, fn);
	};
	model.delete = function(criteria, fn){
		if(!criteria) return fn("no criteria");
		origin.deleteOne(criteria, fn);
	};
	model.select = function(criteria, fn){
		origin.findOne(criteria, fn);
	};
	model.binsert = function(docs, fn){
		origin.insertMany(docs, fn);
	};
	model.bupdate = function(criteria, doc, fn){
		origin.updateMany(criteria, {$set: doc}, fn);
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
		if(selectOptions.$sort)
			aggrarr.push({$sort: selectOptions.$sort});
		if(selectOptions.$skip)
			aggrarr.push({$skip: selectOptions.$skip});
		if(selectOptions.$limit)
			aggrarr.push({$limit: selectOptions.$limit});
		if(selectOptions.$project)
			aggrarr.push({$project: selectOptions.$project});
		origin.aggregate(aggrarr, fn);
	};
	model.upsert = function(criteria, doc, fn){
		origin.updateOne(criteria, {$set: doc}, {upsert:true}, fn);
	};
	model.update2 = function(criteria, updateParam, fn){
		origin.updateOne(criteria, updateParam, fn);
	};
	model.bupdate2 = function(criteria, updateParam, fn){
		origin.updateMany(criteria, updateParam, fn);
	};
	model.upsert2 = function(criteria, updateParam, fn){
		origin.updateOne(criteria, updateParam, {upsert:true}, fn);
	};
	model.count = function(criteria, fn){
		origin.count(criteria, fn);
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

