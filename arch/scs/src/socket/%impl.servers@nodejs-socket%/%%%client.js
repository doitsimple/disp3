var net = require('net');
var log = require("../lib/log");
var client;
function connect(cb){
	client = new net.Socket();
	client.setKeepAlive(true);
	client.on('error', function(err) {
		if (err.code == 'ECONNREFUSED') return log.e("服务未启动！");
		log.e(err);
	});
	client.connect(^^=port$$, "127.0.0.1", function() {
		log.i("socket server connected: ^^=port$$");
		if(cb) cb(client);
	});
	client.on('data', function(data) {
		//console.log(data);
	});
	client.on('close', function() {
		log.i('connetion closed. reconnected 6s after');
		client.destroy();
		client = null;
		setTimeout(function() {
			if(!client)
				connect(cb);
		}, 6000);
	});
}
function sendMsg(msgObj, fn){
//userid, msg
	if(!fn) fn=function(err){if(err) log.e(err);};
	if(!client) return fn("not connected");
	if(!msgObj.userid){
		return fn("no userid");
	}
	try {
		client.write(JSON.stringify(msgObj));
		fn(null);
	}catch(e) {
		fn("connection closed!!");
	}
}
module.exports.connect = connect;
module.exports.sendMsg = sendMsg;
