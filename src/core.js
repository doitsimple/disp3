var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var format = require("./format");
var walk = require("./walk");
var tmpl = require("./tmpl");
var root = path.resolve(__dirname + "/..");
var archRoot = path.resolve(root + "/arch");

module.exports.run = run;
function run(dir, task){
	var cache = format.readAndCheckConfig(dir);

	if(!cache){
		console.error("config error");
		return 0;
	}
	var config = cache.configCache;
	var project = cache.projectCache;
	if(task){
		replaceParams(config, libFile.readJSON(task + ".json"));
	}
	var navPaths = getNavPaths();
	if(!navPaths){
		console.error("get nav paths error");
		return null;
	}
	var genFileList = {};
	for(var i=0; i<navPaths.length; i++){
		var navPath = navPaths[i];
		walk.walk(navPath, project.target, genFileList);
	}
	if(!tmpl.generate(genFileList)){
		console.error("generate error");
		return null;
	}
	cache.filelist = genFileList;
	return cache;
}
function replaceParams(config, config2){
	if(!config) {config = config2; return; }
	libObject.iterate2(config2, config, function(key, itConfig, itConfig2){
		itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!libObject.isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
		itConfig[key].forEach(function(v){
			itConfig2[key].push(v);
		});
	});
}
function getNavPaths(config){
	var arch = config.project.arch;
	var scriptFile = archRoot + "/" + arch + "/load.js";
	if(!fs.existsSync(scriptFile)){
		console.error("no script file for "+ arch);
		return 0;
	}
	var paths = require(archRoot + "/" + arch + "/load")(config);
	paths.push(path.resolve("."));
	return paths;
}

