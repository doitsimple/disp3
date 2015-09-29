var db = require("../db");
var libRandom = require("../lib/random");
module.exports.verify = function(invitecode, fn){
	check(invitecode, function(err, invite){
		if(err) return fn(err);
		invite.invitecode = libRandom.genNum(11);
		fn(null, invite);
	});
}
function check(invitecode, fn){
	if(!invitecode) return fn(null, {invite: "none"});
	invitecode = invitecode.replace(/ /g,"").toLowerCase();
	var Invite = db.getModel("invite");
	var User = db.getModel("user");
	Invite.select({code: invitecode}, function(err, doc){
		if(err) return fn(err);
		console.log(doc);
		if(!doc || !doc.name){
			User.select({invitecode: invitecode}, function(err, user){
				if(err) return fn(err);
				if(!user)
					fn("邀请码不存在");
				else
					fn(null, {
						invite: "user",
						inviteby: user._id
					});
			})
		}else{
			fn(null, {
				"invite": doc.name
			});
		}
	});
}
