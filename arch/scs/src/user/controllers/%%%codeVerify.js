//jianyan sms_code
var libDate = require('../lib/date');
var db = require('../db');
var today = libDate.getDate(new Date());
var libEncrypt = require("../lib/encrypt");
var limit = require('./trylimit.js');

var codeVerify = {};
codeVerify.verify = function(text, user, method, fn) {
	limit.check({
		userid: user._id,
		method: method,
		limits: 3
	}, 'userid', function(err) {
		if (err) return fn(err);
		if (!libEncrypt.bcryptcompare(text, user[method])) {
			limit.inc({
				userid: user._id,
				method: method,
				limits: 3
			}, 'userid', function(err) {
				if (err) return fn(err);
				fn("密码错误");
			});
		} else {
			fn();
		}
	});
}

codeVerify.verify2 = function(params, fn) {
	var key = 'phone';
	limit.check({
		phone: params.phone,
		method: 'sms',
		limits: 5
	}, key, function(err, result) {
		if (err) return fn(err);
		var smscode = db.getModel('smscode');
		smscode.select({
			phone: params.phone,
			code: params.code
		}, function(err, doc) {
			if (err) return fn(err);
			if (!doc) {
				limit.inc({
					phone: params.phone,
					method: 'sms',
					limits: 3
				}, key, function(err) {
					if (err) return fn(err);
					return fn("验证码错误");
				});
			}
			if (new Date().getTime() - new Date(doc.time).getTime() > 60000 * 15) {
				limit.inc({
					phone: params.phone,
					method: 'sms',
					limits: 3
				}, key, function(err) {
					if (err) return fn(err);
					return fn("验证码过期");
				});
			}
			if(!(!doc||new Date().getTime() - new Date(doc.time).getTime() > 60000 * 15)){
				fn();
			}
		});
	});
}

module.exports = codeVerify;
