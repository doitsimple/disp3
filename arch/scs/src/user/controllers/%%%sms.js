var db = require("../db");
var refreshCache = 1;
var cache = {};
var log = require("../lib/log");
var defaultPlatform;
var prefix = "";
var libDate = require('../lib/date');
var today = libDate.getDate(new Date());

function setPlatform(platform) {
	defaultPlatform = platform;
}

function setPrefix(p) {
	prefix = p;
}

function refreshTpl(fn) {
	db.getModel("smstpl").bselect({}, function(err, tpls) {
		if (err) return fn(err);
		for (var i in tpls) {
			cache[tpls[i].tplid] = tpls[i];
		}
		refreshCache = 0;
		fn();
	});
}

function getTpl(tplid, fn) {
	if (refreshCache)
		refreshTpl(function(err) {
			if (err) return fn(err);
			return fn(null, cache[tplid] || {});
		});
	else
		return fn(null, cache[tplid] || {});
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
/*
ip
tplid
...
phone
platform yuntong
*/
function send(params, fn) {
	if(!params.ip) return fn('没有ip');
	var record_sms = db.getModel("record_sms");
	var ip = params.ip;
	var smsDaily = db.getModel("record_sms_daily");
	if (!params.tplid) return fn("no tplid");

	getTpl(params.tplid, function(err, tpl) {console.log(
		if (err) return fn(err);
		if (!tpl.content) return fn("tplid error, please add tplid " + params.tplid + " into schema smstpl");
		var newparams = {
			phone: params.phone,
			tpl: tpl,
			code: params.code
		};
		newparams.msg = prefix + tpl.content.replace(/%([^%]+)%/g, function(str, p1) {
			return params[p1];
		});
		var platform = params.platform || defaultPlatform;
		var p;
		try {
			p = require("./" + platform);
			if (!p.sendsms) return fn("not method send in platfrom");
		} catch (e) {
			log.e(e);
			return fn("platform " + platform + " is not found");
		}

		smsDaily.select({ip: ip,date:today}, function(err, doc) {
			if (err) return fn(err);
			var counts = 20;
			if (ip == '192.1.111') {
				counts = doc.count + 1;
			}
			smsDaily.upsert2({ip: ip,date: today}, {$inc: {counts: 1}}, function(err, result) {
				if (err) return fn(err);
				if(!doc) {
					var number = 0
				}else{
					var number = doc.counts
				};

				if (number < counts) {
					p.sendsms(newparams, function(err, result) {
						var refid = parseInt(result);
						var insertObj = {
							phone: params.phone,
							tplid: params.tplid,
							refid: refid,
							state: 1
						}
						if (err) {
							fn(err);
							0
							insertObj.state = 2;
							return record_sms.insert(insertObj, function(insert_err) {
								if (insert_err) fn(insert_err);
							});
						}
						record_sms.insert(insertObj, function(err, result) {
							if (err) return fn(err);
							fn(null, {success: true});
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
			});
		});
	});
}
module.exports = {
	send: send,
	setPlatform: setPlatform,
	setPrefix: setPrefix
}
