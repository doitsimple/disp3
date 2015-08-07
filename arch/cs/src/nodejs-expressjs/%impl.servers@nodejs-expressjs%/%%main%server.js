var app= require("./app");
var ^^=protocol$$ = require('^^=protocol$$');
var db = require("../core/db");
var fs = require("fs");

process.on('uncaughtException', function(err) {
  //log the error
  console.error(err.stack);
});
var server = ^^=protocol$$.createServer(app);


db.connect(function(){
^^=addon$$
server.listen(^^=port$$, function(){
	console.log('Express server listening on port: ^^=port$$, pid: '+process.pid);	
	if(!fs.existsSync("pid"))
		fs.mkdirSync("pid");
	fs.writeFileSync("pid/^^=name$$", process.pid);
});
});



