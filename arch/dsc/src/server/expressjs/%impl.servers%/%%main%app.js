// Load required packages
var express = require('express');
var bodyParser = require('body-parser');
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


^^if(local.log){$$
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
^^=api$$

module.exports = app;
