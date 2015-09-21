var db =require("../db");
var defaultPlatform;
function setPlatform(platform){
	defaultPlatform = platform;
}
module.exports.verify = function(params, fn){
	var platform = params.platform || defaultPlatform;
	if(!platform) fn("no platform!");
	var Model = db.getModel("idcard");
	Model.select({
		idcard: params.idcard,
		realname: params.realname
	}, function(err, result){
		if(err) return fn(err);
		if(result) fn(null);
		var p;
		try{
			p = require("./" + platform);
			if(!p.verifyIdcard) return fn("not method send in platfrom");
		}catch(e){
			return fn("platform " + params.platform + " is not found");
		}
		p.verifyIdcard(params, function(err){
			if(err) return fn(err);
			Model.upsert({
				idcard: params.idcard,
				realname: params.realname
			}, {}, fn);
		});
	});
}
