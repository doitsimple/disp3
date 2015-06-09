var app= require("./app");
var ^^=protocol$$ = require('^^=protocol$$');
var db = require("../core/db");


process.on('uncaughtException', function(err) {
  //log the error
  console.error(err.stack);
});
var server = ^^=protocol$$.createServer(app);

db.connect(function(){
server.listen(^^=port$$, function(){
	console.log('Express server listening on port: ^^=port$$');
});
});



