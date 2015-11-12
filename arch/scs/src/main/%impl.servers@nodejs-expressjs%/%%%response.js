var fs = require("fs");
var log = require("../lib/log");
var libString = require("../lib/string");
var libObject = require("../lib/object");
module.exports.sendErr = function(res, msg, code){
	if(res.sent) return;
	if(typeof msg == "object"){
		if(msg.message) msg = msg.message;
		else msg = libObject.stringifySimple(msg);
	}
///////
	var logx = "\x1b[1;35m";
	if(code) logx+=code.toString() + "=>";
	logx += msg;
	logx += "\x1b[0m";
  log.e(logx);
/////////
	if(code)
		res.send({
			error:msg,
			errorCode:code
		});
	else
		res.send({
			error:msg
		});
}
module.exports.sendJson = function(res, json){
	if(res.sent) return;
////////////
	var logx = "\x1b[1;32m";
	logx += libObject.stringifySimple(json, undefined);
	logx += "\x1b[0m";
  log.i(logx);
////////////
	res.send(json);
}
module.exports.sendFile = sendFile;
function sendFile(res, file){
	if(!fs.existsSync(file))
		res.status(404).send({message: "not found"});
	else
		fs.createReadStream(file).pipe(res);
}
module.exports.sendImage = function(res, file){
	sendFile(res, file);
}
