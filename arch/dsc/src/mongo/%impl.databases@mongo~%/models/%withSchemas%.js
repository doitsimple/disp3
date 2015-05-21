var async = require('async');
var mongoose = require('mongoose');
var libObject = require("../lib/object");
var json = {};
^^for(var fname in local.fields){var field = fields[fname];$$
//json.^^=fname$$ = {type: ^^=field.type$$};
^^}$$
var Schema = new mongoose.Schema(json);
var Model = mongoose.model('^^=name$$', Schema);

function insert(obj, fn){
	if(libObject.isArray(obj)){
		async.eachSeries(obj, insert, function(err){
			if(err) fn(err);
			else fn(null, {success: true});
		});
		return;
	}
	
	Model.collection.insert(obj, fn);
/*
  var model = new Model(obj);
  model.save(function(err, doc) {
    if (err)
			fn(err);
		else{
			fn(null, {insertId: doc._id});
		}
  });
*/
}
function select(eq, fn){
	selectpro({$eq: eq}, fn);
}
function count(eq, fn){
	selectpro({
		$eq: eq, 
		$count: true
	}, fn);
}

function selectpro(criteria, fn){
	var eq, fields;
	if(criteria.$fields){
		fields = criteria.$fields;
	}
	if(criteria.$eq){
		eq = criteria.$eq;
	}
	var cobj = Model.find(eq, fields);
	var obj = Model.find(eq, fields);
	if(criteria.$match)
		for(var key in criteria.$match){
			if(criteria.$match[key] != ""){
				cobj = cobj.where(key, new RegExp(criteria.$match[key]));
				obj = obj.where(key, new RegExp(criteria.$match[key]));
			}
		}
^^["cmp", "lt", "gt", "gte", "lt", "lte", "ne", "exists"].forEach(function(op){$$
	if(criteria.$^^=op$$)
		for(var key in criteria.$^^=op$$){
			cobj = cobj.where(key).^^=op$$(criteria.$^^=op$$[key]);
			obj = obj.where(key).^^=op$$(criteria.$^^=op$$[key]);
		}
^^})$$
	if(criteria.$range)
		for(var key in criteria.$range){	
			var arr = criteria.$range[key];
			cobj = cobj.where(key).gte(arr[0]).lt(arr[1]);
      obj = obj.where(key).gte(arr[0]).lt(arr[1]);
		}

	cobj.count(function(err, count){
		if (err) {fn(err); return;}
		if(criteria.$count){
			fn(null, {count: count});
			return;
		}
		if(criteria.$rsort){
			var sort = libObject.revKey(criteria.$rsort);
			obj = obj.sort(sort);
		}

^^["sort", "skip", "limit"].forEach(function(op){$$
		if(criteria.$^^=op$$){
			obj = obj.^^=op$$(criteria.$^^=op$$);
		}
^^})$$
		if(count == 0){
			fn(null, {count: 0, data: []});
			return;
		}
		obj.exec(function(err, docs){
			if (err) {fn(err); return;}
			fn(null, {
				count: count,
				data: docs
			});
		});
	});
}
function update(criteria, replace, fn){
	if(!fn) fn=function(){};
	Model.collection.update(criteria, {$set:replace}, {multi: true}, fn);
}
function upsert(criteria, replace, fn){
	if(!fn) fn=function(){};
	Model.collection.update(criteria, replace, {upsert: true}, fn);
}
function _delete(criteria, fn){
	Model.remove(criteria, fn);
}

module.exports.select = select;
module.exports.insert = insert;
module.exports.update = update;
module.exports.delete = _delete;
module.exports.selectpro = selectpro;

module.exports.count = count;
module.exports.upsert = upsert;
// Export the model
module.exports.origin = Model;
