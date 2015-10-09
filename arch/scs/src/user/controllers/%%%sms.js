var db = require("../db");
var refreshCache = 1;
var cache = {};
var defaultPlatform;
var prefix = "";


function setPlatform(platform) {
	defaultPlatform = platform;
}

function setPrefix(p) {
	prefix = p;
}

function refreshTpl(fn) {
	db.getModel("smstpl").bselect({}, function(err, tpls) {
		for (var i in tpls) {
			cache[tpls[i].tplid] = tpls[i].content;
		}
		refreshCache = 0;
		fn();
	});
}

function getTpl(tplid, fn) {
	if (refreshCache)
		refreshTpl(function() {
			return fn(cache[tplid] || "");
		});
	else
		return fn(cache[tplid] || "");
}

function addTpl(json, fn) {
	if (!json.tplid) return fn("no tplid");
	db.getModel("smstpl").upsert({
		tplid: json.tplid
	}, {
		content: json.content
	}, function(err) {
		if (err) return fn(err);
		refreshCache = 1;
		fn();
	});
}
function send(params, fn) {
	var record_sms = db.getModel("record_sms");
	var ip = params.ip;
	var smsDaily = db.getModel("record_sms_daily");
	if (!params.tplid) return fn("no tplid");
	getTpl(params.tplid, function(tpl) {
		if (!tpl) return fn("tplid error, please add tplid " + params.tplid + " into schema smstpl");
		var msg = prefix + tpl.replace(/%([^%]+)%/g, function(str, p1) {
			return params[p1];
		});
		var platform = params.platform || defaultPlatform;
		var p;
		try {
			p = require("./" + platform);
			if (!p.sendsms) return fn("not method send in platfrom");
		} catch (e) {
			return fn("platform " + params.platform + " is not found");
		}
		smsDaily.select({
			ip: ip
		}, function(err, doc) {
			if (err) return fn(err);
			if (doc) {
				console.log(doc.counts);
				if (doc.counts < 20) {
					p.sendsms(params.phone, msg, function(err, result) {
						var refid = parseInt(result);
						var insertObj = {
							phone: params.phone,
							tplid: params.tplid,
							refid: refid,
							state: 1
						}
						if (err) {
							fn(err);
							insertObj.state = 2;
							return record_sms.insert(insertObj, function(insert_err) {
								if (insert_err) console.log(insert_err);
							});
						}
						record_sms.insert(insertObj, function(err) {
							if (err) return fn(err);
							var count = doc.counts+1;
							smsDaily.update({
								ip: ip
							}, {
								ip: ip,
								counts: count
							}, function(err, result) {
								if (err) return fn(err);
								fn(null, {
									success: true
								});
							});
						});
					});
				} else {
					record_sms.update({
						phone: params.phone
					}, {
						state: 2
					}, function(err, result) {
						if (err) return fn(err);
						fn('当前ip发送发送短信超过上限');
					});
				}
			} else {
				p.sendsms(params.phone, msg, function(err, result) {
					var refid = parseInt(result);
					var insertObj = {
						phone: params.phone,
						tplid: params.tplid,
						refid: refid,
						state: 1
					}
					if (err) {
						fn(err);
						insertObj.state = 2;
						return record_sms.insert(insertObj, function(insert_err) {
							if (insert_err) console.log(insert_err);
						});
					}
					record_sms.insert(insertObj, function(err) {
						if (err) return fn(err);
						smsDaily.insert({
							ip: ip,
							counts: 1
						}, function(err) {
							if (err) return fn(err);
							fn(null, {
								success: true
							});
						});
					});
				});
			}
		});
	});
}
module.exports = {
	send: send,
	setPlatform: setPlatform,
	setPrefix: setPrefix
}