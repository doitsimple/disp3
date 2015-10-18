var log = require("../lib/log");
var db= require("../db");
log.i("run ^^=name$$");
db.connect(function(){
	require("../controllers/^^=file$$").^^=method$$(function(err){
		if(err) log.e(err);
		process.exit();
	});
});
