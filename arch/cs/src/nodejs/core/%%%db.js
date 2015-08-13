var sync = require("../lib/sync");
var modelCache = {};
var dbnameMap = {};
var genModelFuncList = {};
var connectFuncs = [];
var initFuncs = [];
^^for(var db in global.impl.databases){var dbconfig=global.impl.databases[db];$$
var ^^=db$$ = require("./^^=db$$")(dbnameMap, genModelFuncList, connectFuncs);
for(var key in ^^=db$$){
	module.exports[key] = ^^=db$$[key];
}
	^^for(var si=0; si<dbconfig.withSchemas.length;si++){var schema = global.proto.schemas[dbconfig.withSchemas[si]];$$
		^^if(schema.init && schema.init.length){$$
			initFuncs.push(function(env, cb){
				getModel("^^=schema.name$$").select({}, function(err, doc){
					console.log("done");
					if(!err && !doc)
						getModel("^^=schema.name$$").binsert(^^=JSON.stringify(schema.init)$$, cb);
					else
						cb();
				});
			});
		^^}$$
	^^}$$
^^}$$

module.exports.connect = function (cb){
	sync.doEachSeries(connectFuncs, function(err){
		if(err) console.error("database connection failed");
		sync.doEachSeries(initFuncs, function(err){
			if(err) console.error("database init failed");
			cb();
		});
		
	});
};
module.exports.getModel = getModel;
function getModel(cname){
	if(!modelCache[cname]){
		var dbname = dbnameMap[cname] || "^^=global.project.db$$";
		modelCache[cname] = genModelFuncList[dbname](cname);
	}
	return modelCache[cname];
}
