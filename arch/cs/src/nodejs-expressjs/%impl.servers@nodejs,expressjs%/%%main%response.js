var fs = require("fs");
module.exports.sendErr = function(res, msg, code){
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
/*^^if(local.debug){$$*/
	var log = "\x1b[1;35m";
	log += JSON.stringify(json, undefined, 2);
	log += "\x1b[0m";
  console.log(log);
/*^^}$$*/
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
