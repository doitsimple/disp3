var sync = require("./lib.js").sync;
var http = require("http");
var fs = require("fs");
var libApp = require("./app.js");
/*
var log =require("../lib/log");
var libDate = require("../lib/date");
log.setOutfile("log/"+libDate.getDate(new Date()) + "-server.log");
*/
process.on('uncaughtException', function(err) {
  console.log(err.stack);
});
sync([function (fn){
	var server = http.createServer(libApp);
	server.listen(8088, function(err){
		if(err){
			
fn(err);


			return;
		}
		console.log('Express http server listening on port: 8088, pid: '+process.pid);
		fs.writeFileSync(".pid", process.pid);
		fn(null);

	});
}
], function(err){
	if(err){
		console.log("Server start failed.");

		return;
	}
	console.log("Server start succeed.");

});

