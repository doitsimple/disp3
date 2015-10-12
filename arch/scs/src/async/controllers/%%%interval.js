var db = require("../db");
var log = require("../lib/log");
module.exports = Interval;
function Interval(name){
	var self = this;
	self.name = name;
	var intervalCache = {};
}
function pause(fn){
	fn();
}
function recover(fn){
	db.getModel("emitter").each(function(err, doc){
		if(err) return log.e(err);
		if(doc.status != 1) return;
		createInterval(doc._id.toString(), doc);
	}, fn);
}
function endInterval(_id, doc, fn){
	require("../controllers/"+ doc.file)[doc.method](doc.params, function(err){
		if(err) return log.e(err);
		finish(_id, function(err){
			if(err) return fn(err);
			fn();
		});
	});
}
function createInterval(_id, doc){
	if(doc.interval > 0){
		var timeout = 0;
		var lock = 0;
		intervalCache[_id] = setInterval(function(){
			timeout += doc.interval;
			if(lock) return;
			lock = 1;
			if(timeout > doc.timeout){
				clearInterval(intervalCache[_id]);
				endInterval(_id, doc, function(err){
					if(err) return log.e(err);
				})
				return;
			}
			require("../controllers/"+ doc.file)[doc.method](doc.params, function(err, info){
				if(err) return log.e(err);
			});			
		}, doc.interval);											 
	}else{
		intervalCache[_id] = setTimeout(function(){
			endInterval(_id, doc, function(err){
				if(err) return log.e(err);
			})
    }, doc.timeout);
	}
}
function start(doc, fn){
	if(!doc.file || !doc.method) return fn("no file or method");
	try{
		var func = require("../controllers/"+ doc.file)[doc.method];
		if(typeof func != "function") 
			return fn(doc.method + " is not a function");
	}catch(e){
		return fn("file or method error " + doc.file + "." + doc.method);
	}
	if(doc.interval){
		try{
			var repfunc = require("../controllers/"+ doc.file)[doc.reqpmethod];
			if(typeof repfunc != "function") 
				return fn(doc.repmethod + " is not a function");
		}catch(e){
			return fn("file or method error " + doc.file + "." + doc.repmethod);
		}
	}
	db.getModel("interval").insert(doc, function(err, result){
		if(err) return fn(err);
		var id = result.insertedId.toString();
	});
};
function finish(_id, fn){
	db.getModel("interval").update({
		_id: _id
	}, {status:2}, function(err, result){
		if(err) return fn(err);
		delete intervalCache[_id];
		fn();
	});
}

