/*
var log =require("../lib/log");
var libDate = require("../lib/date");
log.setOutfile("log/"+libDate.getDate(new Date()) + "-^^=name$$.log");
*/
process.on('uncaughtException', function(err) {
  console.log(err.stack);
});
^^
var syncFuns = [].concat(global.startups);
syncFuns.push({
	createServer: global.config
});
var callback = {
	error: {print: {val:"Server start failed."}},
	success: {print: {val:"Server start succeed."}}
}
$$
^^=~sync: syncFuns, callback: callback$$

