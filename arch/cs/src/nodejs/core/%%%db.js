var sync = require("../lib/sync");
var modelCache = {};
var dbnameMap = {};
var genModelFuncList = {};
var connectFuncs = [];
/*^^for(var db in global.impl.databases){$$*/
var ^^=db$$ = require("./^^=db$$")(dbnameMap, genModelFuncList, connectFuncs);
for(var key in ^^=db$$){
	module.exports[key] = ^^=db$$[key];
}
/*^^}$$*/

module.exports.connect = function (cb){
	sync.doEachSeries(connectFuncs, cb);
};
module.exports.getModel = getModel;
function getModel(cname){
	if(!modelCache[cname]){
		var dbname = dbnameMap[cname] || "^^=global.project.db$$";
		modelCache[cname] = genModelFuncList[dbname](cname);
	}
	return modelCache[cname];
}
