var app = require("./app");
var net = require('net');
var db = require("../db");
var log =require("../lib/log");
var server = net.createServer();
var fs = require("fs");

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
