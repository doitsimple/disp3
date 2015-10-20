var app = require("./app");
var net = require('net');
var db = require("../db");
var log =require("../lib/log");
var server = net.createServer();
var fs = require("fs");
var libDate = require("../lib/date");
process.on('uncaughtException', function(err) {
  //log the error
  log.e(err.stack);
});
log.setOutfile("log/"+libDate.getDate(new Date()) + "-^^=name$$.log");
server.on('connection', app.connection);
var port = ^^=port$$;
db.connect(function(){
	server.listen(port, function(s) {
		log.i('Socket server listening on port: ^^=port$$, pid: '+process.pid);	
		if (!fs.existsSync("pid"))
			fs.mkdirSync("pid");
		fs.writeFileSync("pid/^^=name$$", process.pid);
	});
});
