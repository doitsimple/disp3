var fs = require("fs");
module.exports.sendErr = function(res, msg, code){
	if(typeof msg == "object"){
		if(msg.message) msg = msg.message;
		else msg = JSON.stringify(msg, undefined);
	}
///////
	var log = "\x1b[1;35m";
	if(code) log+=code.toString() + "=>";
	log += msg;
	log += "\x1b[0m";
  console.log(log);
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
	var log = "\x1b[1;32m";
	log += JSON.stringify(json, undefined);
	log += "\x1b[0m";
  console.log(log);
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
