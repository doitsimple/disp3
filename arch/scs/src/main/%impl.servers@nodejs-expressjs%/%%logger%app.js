app.use(function(req, res, next){
	var logx = "\x1b[1;36m";
	var ip = req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	logx += req.method + " " + req.originalUrl + "  ip:" + ip + "\n";
	if(req.method != "GET" && req.method != "DELETE"){
		var bodystr = JSON.stringify(req.body,undefined);
		if(bodystr != "{}")
			logx+=JSON.stringify(req.body,undefined)+"\n";
	}
	logx+=req.headers['user-agent'];
	logx+="\x1b[0m";
	log.i(logx);
^^if(!global.product){$$
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
^^}$$
	next();
});
