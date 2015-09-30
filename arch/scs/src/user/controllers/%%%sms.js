var db =require("../db");
var refreshCache = 1;
var cache = {};
var defaultPlatform;
var prefix = "";
function setPlatform(platform){
	defaultPlatform = platform;
}
function setPrefix(p){
	prefix = p;
}
function refreshTpl(fn){
	db.getModel("smstpl").bselect({}, function(err, tpls){
		for(var i in tpls){
			cache[tpls[i].tplid] = tpls[i].content;
		}
		refreshCache = 0;
		fn();
	});
}
function getTpl(tplid, fn){
	if(refreshCache)
		refreshTpl(function(){
			return fn(cache[tplid] || "");
		});
	else
	  	return fn(cache[tplid] || "");
}
function addTpl(json, fn){
	if(!json.tplid) return fn("no tplid");
	db.getModel("smstpl").upsert({
		tplid: json.tplid
	}, {
		content: json.content
	}, function(err){
		if(err) return fn(err);
		refreshCache = 1;
		fn();
	});
}
function send(params, fn){
	if(!params.tplid) return fn("no tplid");//-->tplid
	getTpl(params.tplid, function(tpl){
		if(!tpl) return fn("tplid error, please add tplid "+params.tplid+ " into schema smstpl");
		var msg = prefix + tpl.replace(/%([^%]+)%/g, function(str, p1){
			return params[p1];
		});
		var platform = params.platform || defaultPlatform;
		var p;
		try{
			p = require("./" + platform);//--->
			if(!p.sendsms) return fn("not method send in platfrom");
		}catch(e){
			return fn("platform " + params.platform + " is not found");
		}
		p.sendsms(params.phone, msg, function(err,result){
			if(err) return fn(err);
			console.log(result);
			var refid = parseInt(result);
			db.getModel("record_sms").insert({
				phone: params.phone,
				tplid: params.tplid,
				refid: refid,
				state: 1
			}, function(err){
				if(err) return fn(err);
				fn(null, {success: true});
			});
		});
	});
}
module.exports = {
	send: send,
	setPlatform: setPlatform,
	setPrefix: setPrefix
}

