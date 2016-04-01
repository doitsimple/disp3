/*
var log =require("../lib/log");
var libDate = require("../lib/date");
log.setOutfile("log/"+libDate.getDate(new Date()) + "-^^=name$$.log");
*/
process.on('uncaughtException', function(err) {
  console.log(err.stack);
});
^^
var syncFuncs = $.concat(global.startups, {
	createServer: global.config
});
var error =  {print: {val:"Server start failed."}};
var	success = {print: {val:"Server start succeed."}};
$$
^^=~sync: syncFuncs, error: error, success: success$$

