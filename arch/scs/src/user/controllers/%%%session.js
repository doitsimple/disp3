var Session = {};
var db = require("../db");
Session.supplementary = function(param, fn) {
	var session = param.session;
	var index = param.index;
	var device_token = param.device_token;
	var content = param.content;
	var userid = param.userid;
	if (!session) return fn("no session");
	if (!device_token) return fn("no device_token");
	session = session.toString();
	index = parseInt(index);
	var Session = db.getModel('session');
	Session.select({
		"session": session,
		"device_token": device_token
	}, function(err, doc) {
		if (err) return fn(err);
		if (!doc) return fn(null, {
			ignore: true
		});
		var json = {};
		if (userid && !doc.userid)
			json.userid = parseInt(userid);
		if (!doc.lastindex) {
			//第一次传用户体验数据
			if (index != 1)
				return fn("index not begin with 1");
			json.lastindex = 1;
			json.content = content;
		} else {
			if (doc['lastindex'] != index - 1)
				return fn("发送用户体验错误：lastindex is " + doc['lastindex']);
			json.lastindex = index;
			json.content = doc['content'] + content;
		}
		Session.update({
			"session": session,
			"device_token": device_token
		}, json, function(err, result) {
			if (err) return fn(err);
			if (!result.n) return fn(null, {
				ignore: true
			});
			fn(null, {
				success: true
			});
		});
	});
}

module.exports = Session;