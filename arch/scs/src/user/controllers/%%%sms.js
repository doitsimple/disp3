var db = require("../db");
var refreshCache = 1;
var cache = {};
var log = require("../lib/log");
var defaultPlatform = "";
var prefix = "";
var libDate = require('../lib/date');
/*^^if(global.product){$$*/
var ip_limit_perday = 200;
/*^^}else{$$*/
var ip_limit_perday = 3;
/*^^}$$*/
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

function makemsg(newparams, params, tpl, fn){
	var msgerr;
	newparams.msg = prefix + tpl.content.replace(/%([^%]+)%/g, function(str, p1) {
		if (!params.hasOwnProperty(p1)) msgerr = "sms.send缺少属性:[" + p1 + "]";
		return params[p1];
	});
	if (msgerr) return fn(msgerr);
	fn();
}
/*
ip
tplid
...
phone
platform yuntong
*/
function send(params, fn) {
	var today = libDate.getDate(new Date());
	if (!params.ip) return fn('没有IP');
	if (!params.tplid) return fn("没有指定模板");
	if (!params.phone) return fn("没有手机号");
	var record_sms = db.getModel("record_sms");
	var smsDaily = db.getModel("record_sms_daily");
	var ip = params.ip;
	var tplid = params.tplid;
	getTpl(tplid, function(err, tpl) {
		if (err) return fn(err);
		if (!tpl.content) return fn("tplid error, please add tplid " + tplid + " into schema smstpl");
		var newparams = {
			phone: params.phone
		};
		makemsg(newparams, params, tpl, function(err){
			if(err) return fn(err);
			var platform = params.platform || defaultPlatform;
			var p;
			try {
				p = require("./" + platform);
				if (!p.sendsms) return fn("not method send in platfrom");
			} catch (e) {
				log.e(e);
				return fn("platform " + platform + " is not found");
			}
			if (ip.match(/^\d{1,3}(?:\.\d{1,3}){3}/g)) {
				smsDaily.select({
					ip: ip,
					date: today
				}, function(err, doc) {
					if (err) return fn(err);
					smsDaily.upsert2({
						ip: ip,
						date: today
					}, {
						$inc: {
							counts: 1
						}
					}, function(err, result) {
						if (err) return fn(err);
						//filter local ip
						if (!doc || ip == "127.0.0.1" || ip.match(/^192\.168(?:\.\d{1,3}){2}/g) || (doc.counts && doc.counts < ip_limit_perday)) {
							p.sendsms(newparams, function(err, result) {
								var refid = parseInt(result);
								var insertObj = {
									phone: params.phone,
									platform: platform,
									tplid: tplid,
									refid: refid,
									status: 1
								}
								if (err) {
									fn(err);
									//发送错误
									insertObj.status = 2;
									record_sms.insert(insertObj, function(insert_err) {
										if (insert_err) log.e(insert_err);
									});
								} else {
									log.v("sms.send:" + newparams.phone + "\t" + newparams.msg);
									fn(null, {
										success: true
									});
									//already fn
									record_sms.insert(insertObj, function(err, result) {
										if (err) log.e(err);
									});
								}
							});
						} else {
							fn('当前ip发送发送短信超过上限');
							//already fn
							record_sms.update({
								phone: params.phone
							}, {
								status: 2,
								message: "当日ip超限"+doc.counts
							}, function(err, result) {
								if (err) log.e(err);
							});
						}
					});
				});
			} else {
				fn('ip格式错误');
				record_sms.insert({
					phone: params.phone
				}, {
					status: 2,
					message: "ip格式错误"+ip
				}, function(err, result) {
					if (err) log.e(err);
				});
			}
		});
	});
}
module.exports = {
	addTpl: addTpl,
	send: send,
	setPlatform: setPlatform,
	setPrefix: setPrefix
}
