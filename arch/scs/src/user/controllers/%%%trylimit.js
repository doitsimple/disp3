var libDate = require('../lib/date');
var db = require('../db');
var today = libDate.getDate(new Date());

var limit = {};

limit.inc = function(params,fn) {
		var password = db.getModel('password');
		password.upsert2({
			userid: params._id,
			date: today,
			method: params.method
		}, {
			$inc: {
				counts: 1
			}
		}, function(err, result) {
			if(err) return fn(err);
		});
}

limit.check = function(params,fn) {
		var password = db.getModel('password');
		password.select({
			_id: params._id,
			method: params.method,
			date: today
		}, function(err, doc) {
			if (err) return fn(err);
            if (!doc) return fn(null,0);
			return fn(null,doc.counts);
		});
}

module.exports = limit;