var libDate = require('../lib/date');
var db = require('../db');

var limit = {};

limit.check = function(params, key, fn) {
	var today = libDate.getDate(new Date());
	var Model = db.getModel('trylimit');
	var where = {
		key: params[key],
		method: params.method,
		date: today
	};
	Model.select(where, function(err, doc) {
		if (err) return fn(err);
		if (doc && doc.count >= params.limits)
			return fn("尝试超过限制");
			fn();
	});
}

limit.inc = function(params,key,fn) {
	var today = libDate.getDate(new Date());
	var where = {
		key: params[key],
		method: params.method,
		date: today
	};
	var Model = db.getModel('trylimit');
	Model.upsert2(where, {
		$inc: {
			count: 1
		}
	}, function(err, result) {
		if (err) return fn(err);
		fn(null);
	});
}

module.exports = limit;