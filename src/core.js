var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var format = require("./format");
var walk = require("./walk");
var tmpl = require("./tmpl");
var log = require("./log");

module.exports.run = run;
/*

*/
function run(projectDir, rootDir, task){

	var cache = format.readAndCheckConfig(projectDir, rootDir);
	if(!cache){
    log.e("read project.json file failed");
		return 0;
	}
	var configCache = cache.config;
	configCache.env = {};
	configCache.env.rootDir = rootDir;
	var formatCache = cache.format;
	if(task && task != "main"){
		libObject.extend(configCache, libFile.readJSON(task + ".json"));
	}
	var navPaths = getNavPaths(configCache);
	log.i(navPaths);
	if(!navPaths || !navPaths.length){
		log.e("get nav paths error");
		return null;
	}
	var genFileList = {};
	for(var i=0; i<navPaths.length; i++){
		var navPath = navPaths[i];
		if(!fs.existsSync(navPath)) continue;
		if(!walk.walk(navPath, cache.config.project.target, configCache, genFileList)){
			log.e("walk " + navPath + " failed");
			return null;
		}
	}
	log.v(genFileList);

	if(!tmpl.generate(genFileList, configCache)){
		log.e("generate error");
		return null;
	}
	cache.filelist = genFileList;
	return cache;
}

function getNavPaths(config){
	var arch = config.project.arch;
	var archRoot = path.resolve(config.env.rootDir + "/arch/" + arch);
	var scriptFile = path.resolve(archRoot + "/load.js");
	var paths;
	if(!fs.existsSync(scriptFile)){
		log.i("no script file " + scriptFile);
		log.i("use " + archRoot);
		paths = [archRoot];
	}else{
		config.env.archSrcDir = path.resolve(archRoot + "/src");
		var res = require(scriptFile)(config);
		if(res)
			paths = res;
		else{
			log.e("get path error: " + scriptFile);
			return 0;
		}
	}
	paths.push(path.resolve("."));
	return paths;
}

