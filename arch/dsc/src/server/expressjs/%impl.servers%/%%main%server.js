var app= require("./app");
var ^^=protocol$$ = require('^^=protocol$$');

process.on('uncaughtException', function(err) {
  //log the error
  console.error(err.stack);
});
var server = ^^=protocol$$.createServer(app);


server.listen(^^=port$$, function(){
	console.log('Express server listening on port: ^^=port$$');
});



