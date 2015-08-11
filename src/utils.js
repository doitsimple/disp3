var libArray = require("../lib/js/array");
var libFile = require("../lib/nodejs/file");
var libObject = require("../lib/js/object");
var libSync = require("../lib/js/sync");
var libPrompt = require("../lib/nodejs/prompt");
module.exports = {
	extend: extend,
	readGlobal: readGlobal,
	selectRoles: selectRoles
}
function extend(config, config2){
	if(!config) {config = config2; return; }
	libObject.iterate2(config2, config, function(key, itConfig, itConfig2){
		itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!libObject.isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
//		itConfig2[key] = itConfig[key];
		itConfig[key].forEach(function(v){
			libArray.pushIfNotExists(itConfig2[key], v);
		});
	});
}
function readGlobal(dir){
	return libFile.readJSON(dir + "/disp.global.json");
}
function selectRoles(env, fn){
	var roles = {};
	libSync.eachSeries(Object.keys(env.project.roles), function(key, cb){
		libPrompt.select(env.project.roles[key], function(role){
			roles[key] = role;
			cb();
		});
	}, function(){
		fn(roles);
	});
}

