// Load required packages
var express = require('express');
var bodyParser = require('body-parser');
var libReq = require("../lib/req");
var libRes = require("./response");
var sendErr = libRes.sendErr;
var sendFile = libRes.sendFile;
var sendJson = libRes.sendJson;

^^=require$$

// Create our Express application
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

^^if(static){$$
app.use(express.static(__dirname + '/^^=static$$'));
^^}$$


^^if(local.debug){$$
app.use(function(req, res, next){
//	console.log(Object.keys(req));
	var log = "\x1b[1;36m";
	log += req.method + " " + req.originalUrl + "\n";
	if(req.method != "GET" && req.method != "DELETE"){
		var bodystr = JSON.stringify(req.body,undefined,2);
		if(bodystr != "{}")
			log+=JSON.stringify(req.body,undefined,2)+"\n";
	}
	log+=req.headers['user-agent'] + "\n";
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	log+=ip + "\n" + new Date();
	log+="\x1b[0m";
	console.log(log);
	next();
});
^^}$$
^^=setting$$
^^function makeReq(json){
	var arr = [];
	for(var key in json){
		arr.push(key + ":" + json[key]);
	}
	return arr.join(",");
}$$

^^function makeController(api){
/* make controller */$$
^^
for(var j=0; j<api.controllers.length; j++){var ctrl = api.controllers[j];$$
 ^^switch(ctrl.type){ case "req": $$

libReq.^^=ctrl.method$$("^^=ctrl.url$$", {
^^=makeReq(ctrl.data)$$
}, function(err, result){
if(err) return sendErr(res, err);
^^if(ctrl.send){$$
sendJson(res, ^^=ctrl.send$$);
^^}$$

 ^^break;case "send":$$
^^if(ctrl.send){$$
sendJson(res, ^^=ctrl.send$$);
^^}$$

 ^^break;case "updatedb":$$

 ^^break;}$$
^^}$$

^^for(var j=0; j<api.controllers.length; j++){$$
 ^^switch(ctrl.type){ 
  case "req":
  case "updatedb":$$
});
 ^^break;default: $$
 ^^break;}$$
^^}
/* make controller done */$$
^^}$$



var auth = require("./auth");
var router = express.Router();
^^for(var i=0; i<withApis.length; i++){ 
	var api = global.proto.apis[withApis[i]];
	var paramsStr = "";
	var midwaresStr = "";
	for(var j in api.midwares){
		var midware= api.midwares[j];
		switch (midware.type){
			case "auth": 
				if(!midware.scope)
					midwaresStr += "auth.midware, ";
				else
					midwaresStr += "auth.midwares[" + midware.scope +"], ";
			break;
		}
	}
	
	switch(api.type){
		case "post":
$$
router.route('/^^=api.route$$^^=paramsStr$$').post(^^=midwaresStr$$function(req, res){
^^for(var key in api.params){var param = api.params[key];$$
var ^^=key$$ = req.body["^^=key$$"];
 ^^if(param.required){$$
if(!^^=key$$) return sendErr(res, "^^=key$$ not exist");
 ^^}$$
^^}$$
^^makeController(api)$$
});
^^break; case "rest":$$
^^break;}$$
^^}$$

app.use('/api', router);

^^=apiblock$$

module.exports = app;
