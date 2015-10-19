app.use(function(req, res, next){
//	console.log(Object.keys(req));
	var log = "\x1b[1;36m";
	var ip = req.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	log += req.method + " " + req.originalUrl + "  ip:" + ip + "  " + libDate.getSimple(new Date())+ "\n";
	if(req.method != "GET" && req.method != "DELETE"){
		var bodystr = JSON.stringify(req.body,undefined);
		if(bodystr != "{}")
			log+=JSON.stringify(req.body,undefined)+"\n";
	}
	log+=req.headers['user-agent'];
	log+="\x1b[0m";
	console.log(log);
^^if(!global.product){$$
	res.header("Access-Control-Allow-Origin", "*");
^^}$$
	next();
});
