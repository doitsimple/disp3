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
			console.log('message>>>>>'+result);
			console.log('message>>>>>'+result);
			console.log('message>>>>>'+result);
			console.log(doc);
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
					if(err) return fn(err);
					fn(null,cb);
				});
			} else {
				if (new Date().getTime() - new Date(doc.time).getTime() > 60000 * 15) {
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
		_id: params._id
	}, function(err, doc) {
		var cb = '';
		if (err) return fn(err);
		Verify.find({
			_id: params._id,
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
				if (!libEncrypt.bcryptcompare(params[method], doc[method])) {
					cb = "密码错误";
					Verify.verify({
						_id: params._id,
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