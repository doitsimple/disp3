var libObject = require("./lib/object.js");
module.exports.sendRes = function(func){
	var rtnFunc = function(req, res){
		func(req, function(err, result, errorCode){
			if(err == "set"){
				res.set('Content-Type', 'application/json');
				return;
			}
			var json;
			if(errorCode) 
				json = {
          errorCode: errorCode,
          error: err,
          result: result
        };
			else if(err){
/*
				if(typeof err == "string")
					json = {
						error: err,
						result: result,
						message: err
					}
				else
*/
					json = {
						error: err,
						result: result
					};
			}
			else
				json = result;
/*^^if(local.log){$$*/
			var log = "\x1b[1;35m";
			if(libObject.isBuffer(json))
				log += "BUFFER";
			else if(libObject.isArray(json))
				log += "ARRAY";
			else if(typeof json != "string")
				log += JSON.stringify(json, undefined, 2);
			else
				log += "BLOCK";
			log += "\x1b[0m";
			console.log(log);
/*^^}$$*/
			res.send(json);
		});
	}
	return rtnFunc;
}
