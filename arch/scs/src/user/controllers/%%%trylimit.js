var libDate = require('../lib/date');
var db = require('../db');

var limit = {};

limit.check = function(params, fn){
	var today = libDate.getDate(new Date());
	var Model = db.getModel('trylimit');
	var where = {
    userid: params.userid,
    method: params.method,
    date: today
  };
	Model.select(where, function(err, doc){
		if(err) return fn(err);
		if(doc && doc.count > params.limits)
			return fn("尝试超过限制");
		Model.upsert2(where,{
			$inc: {
				count: 1
			}
		}, function(err, result) {
			if(err) return fn(err);
			fn();
		});
	});
}

module.exports = limit;
