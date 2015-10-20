var fs = require("fs");
var log = require("../lib/log");
module.exports.sendErr = function(res, msg, code){
	if(typeof msg == "object"){
		if(msg.message) msg = msg.message;
		else msg = JSON.stringify(msg, undefined);
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
////////////
	var logx = "\x1b[1;32m";
	logx += JSON.stringify(json, undefined);
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
