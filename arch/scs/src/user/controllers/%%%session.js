var Session = {};
var db = require("../db");
Session.supplementary = function(session, index, content, userid, fn) {
	session = session.toString();
	index = parseInt(index);
	var Userexp = db.getModel('userexp');
	Userexp.select({
		"session": session
	}, function(err, userexp) {
		if (err) return fn(err);
		if (!userexp) return fn(null, {
			ignore: true
		});
		var json = {};
		if (userid && !userexp.userid)
			json.userid = parseInt(userid);
		if (!userexp.lastindex) {
			//第一次传用户体验数据
			if (index != 1)
				return fn("index not begin with 1");
			json.lastindex = 1;
			json.content = content;
		} else {
			if (userexp['lastindex'] != index - 1)
				return fn("发送用户体验错误：lastindex is " + userexp['lastindex']);
			json.lastindex = index;
			json.content = userexp['content'] + content;
		}
		Userexp.update({
			"session": session
		}, json, function(err, result) {
			if (err) return fn(err);
			if (!result.n) return fn(null, {
				ignore: true
			});
			fn(null, {
				success: true
			});
		});;
	});
}

module.exports = Session;