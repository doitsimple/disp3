//jianyan sms_code
var libDate = require('../lib/date');
var db = require('../db');
var today = libDate.getDate(new Date());
var libEncrypt = require("../lib/encrypt");
var Verify = require('./Verify.js');

var codeVerify = {};

codeVerify.verify = function(params, fn) {
	var smscode = db.getModel('smscode');
	smscode.select({
		phone: params.phone,
		code: params.code
	}, function(err, doc) {
		var cb = '';
		if (err) return fn(err);
		Verify.find({
			phone: params.phone,
			method: 'sms'
		}, function(err, result) {
			console.log(result);
			if (result > 5) {
				cb = "您验证码已经输错五次啦，不能继续验证了";
				return fn(null, cb);
			}
			if (!doc) {
				cb = "验证码错误";
				Verify.verify({
					phone: params.phone,
					method: 'sms'
				}, function(err, result) {
					return fn(null, cb);
				});
			} else {
				if (new Date().getTime() - new Date(doc.time).getTime() > 60000 * 5) {
					cb = "验证码过期";
					Verify.verify({
						phone: params.phone,
						method: 'sms'
					}, function(err) {
						if (err) return fn(err);
						return fn(null, cb);
					});
				}
			}
			fn(null, cb)
		});
	});
}


codeVerify.verifyPassword = function(params, fn) {
	var user = db.getModel('user');
	user.select({
		phone: params.phone
	}, function(err, doc) {
		var cb = '';
		if (err) return fn(err);
		Verify.find({
			phone: params.phone,
			method: params.method
		}, function(err, result) {
			if (result > 3) {
				cb = "您"+params.method+"已经输错三次啦，不能继续验证了";
				return fn(null, cb);
			}
			if (!doc) {
				cb = "用户名不存在";
				return fn(null, cb);
			} else {
				var method = params.method;
				console.log('>>>>>>>>>>'+params[method]);
				console.log('>>>>>>>>>>'+doc[method]);
				if (!libEncrypt.bcryptcompare(params[method], doc[method])) {
					cb = "密码错误";
					Verify.verify({
						phone: params.phone,
						method: params.method
					}, function(err) {
						if (err) return fn(err);
						return fn(null, cb);
					});
				}
			}
			fn(null, cb)
		});
	});
}









module.exports = codeVerify;