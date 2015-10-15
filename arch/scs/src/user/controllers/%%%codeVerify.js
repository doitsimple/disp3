//jianyan sms_code
var libDate = require('../lib/date');
var db = require('../db');
var today = libDate.getDate(new Date());
var libEncrypt = require("../lib/encrypt");
var limit = require('./trylimit.js');

var codeVerify = {};

codeVerify.verify = function(params, fn) {
	var smscode = db.getModel('smscode');
	smscode.select({
		phone: params.phone,
		code: params.code
	}, function(err, doc) {
		if (err) return fn(err);
		if (!doc) return fn("验证码错误");
		if (new Date().getTime() - new Date(doc.time).getTime() > 60000 * 15)
			return fn("验证码过期");
		limit.check({
			phone: params.phone,
			method: 'sms'
		}, function(err, count) {
			if(err) return fn(err);
			if (count > 5)
				return fn("您验证码已经输错五次啦，不能继续验证了");
			limit.inc({
				phone: params.phone,
				method: 'sms'
			}, function(err, result) {
				if(err) return fn(err);
				fn();
			});
		});
	});
}


codeVerify.verifyPassword = function(params, fn) {
	var user = db.getModel('user');
	var selectparams = {};
	var checkparams = {};
	var incparams = {};
	if (params.phone) {
		selectparams = {
			phone: params.phone
		};
		checkparams = {
			phone: params.phone,
			method: params.method
		}
		incparams = {
			phone: params.phone,
			method: params.method
		}
	} else {
		selectparams = {
			_id: params._id
		};
		checkparams = {
			_id: params._id,
			method: params.method
		}
		incparams = {
			_id: params._id,
			method: params.method
		}
	}
	user.select(selectparams, function(err, doc) {
		var cb = '';
		if (err) {
			console.log('message');
			return fn(err);
		}
		limit.check(checkparams, function(err, result) {
			if (result > 3) {
				cb = "您" + params.method + "已经输错三次啦，不能继续验证了";
				if (params.phone) {
							fn(null, {cb: cb,userid: doc._id});
				} else {
					fn(null, cb);
				}
				return fn(null, cb);
			}
			if (!doc) {
				if (params.phone) {
							fn(null, {cb: cb,userid: doc._id});
				} else {
					fn(null, cb);
				}
				cb = "用户名不存在";
				return fn(null, cb);
			} else {
				var method = params.method;
				if (!libEncrypt.bcryptcompare(params[method], doc[method])) {
					cb = "密码错误";
					limit.inc(incparams, function(err) {
						if (err) return fn(err);
						if (params.phone) {
							fn(null, {cb: cb,userid: doc._id});
						} else {
							fn(null, cb);
						}
					});
				}
			}
			if (params.phone) {
				fn(null, {cb: cb,userid: doc._id})
			} else {
				fn(null, cb);
			}
		});
	});
}



module.exports = codeVerify;
