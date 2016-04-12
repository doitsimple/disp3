var libReq = require("../lib/req");
var string = require("../lib/string");
var encrypt = require("../lib/encrypt");
var date = require("../lib/date");

var rooturl = "https://app.cloopen.com:8883/2013-12-26/Accounts/";
var accountid = "8a48b5514f49079e014f4eea26e20d35"; //ACCOUNT SID
var token = "26f85bb3e3d14581afed8f414855e673"; //AUTH TOKEN
var appid = "8a48b5514f49079e014f4ef380dd0d59";
module.exports.sendsms = function(params, fn) {
	_send(params, fn);
};
module.exports.sendVoice = function(params, fn) {
	params.voiceflag = 1;
	_send(params, fn);
}

function _send(params, fn) {
	var data;
	if(params.voiceflag) {
		data = {
			"appId": appid,
			"verifyCode": params.code,
			"to": params.phone,
			"playTimes": 2
		}
	}else{
		var datas = [];
		params.tpl.content.replace(/%(\S+)%/g, function(str, p1){
			datas.push(params[p1]);
		});
		console.log(datas);
		data = {
			"to": params.phone,
			"appId": appid,
			"templateId": params.tpl.yuntongxunId,
			"datas": datas
		}
	}
	var dataLength = string.strlen(data);
	var authorization = encrypt.base64(accountid + ":" + date.formatDate(new Date(), "yyyyMMddhhmmss"));
	var headers = {
		"Accept": "application/json",
		"Content-Type": "application/json;charset=utf-8",
		"Content-Length": dataLength,
		"Authorization": authorization
	};
	var service = params.voiceflag ? "/Calls/VoiceVerify" : "/SMS/TemplateSMS";

	var url = rooturl +
				accountid + service + "?sig=" +
				encrypt.md5(accountid + token + date.formatDate(new Date(), "yyyyMMddhhmmss")).toUpperCase();
	libReq.postEx(url, headers, data, function(err, result) {
		if (err) return fn(err);
		console.log(result);
		if (result.statusCode == "000000")
			return fn(null, result.smsMessageSid);
		return fn(result);
	});
}
