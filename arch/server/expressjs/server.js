/*
var log =require("../lib/log");
var libDate = require("../lib/date");
log.setOutfile("log/"+libDate.getDate(new Date()) + "-^^=name$$.log");
*/
process.on('uncaughtException', function(err) {
  console.log(err.stack);
});
var fs = require("fs");
var app= require("./app");
var runs = [];
^^if(local.db){$$
runs.push(connectDb);
function connectDb(){
}
^^}$$
^^if(local.http){$$
runs.push(createHttpServer);
var http = require('http');
function createHttpServer(fn){
	var server = http.createServer(app);
	server.listen(^^=http.port$$, function(){
		console.log('Express http server listening on port: ^^=http.port$$, pid: '+process.pid);
		fs.writeFileSync("pid", process.pid);
		fn();
	});
}
^^}$$
^^=main$$
function callback(err){
	if(!err)
		console.log("Server start success!");
	else
		console.log("Server start failed " + err);
}
^^=~sync: {get: "runs"}, callback: {get: "callback"}$$
/*
var db = require("../db");
var sync =require("../lib/sync");
app.close = function(){
	server.close();
}

db.connect(function(err){
	if(err){
		log.e(err);
		return;
	}
	prelisten(function(){
		server.listen(^^=port$$, function(){
			log.i('Express server listening on port: ^^=port$$, pid: '+process.pid);
			if(!fs.existsSync("pid"))
				fs.mkdirSync("pid");
			fs.writeFileSync("pid/^^=name$$", process.pid);
		});
	});
});

*/

