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
    log.e("read json file failed");
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
		if(!walk.walk(navPath, configCache.project.target, configCache, genFileList)){
			log.e("walk " + navPath + " failed");
			return null;
		}
	}
	fs.writeFileSync(configCache.project.target+"/.filelist.json", JSON.stringify(genFileList, undefined, 2));
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

	var paths = [];
	var archSrc = path.resolve(archRoot + "/src");
	var types = [];
	var mods = {};
	if(config.project.navspaces.length)
		for(var i in config.project.navspaces){
			var navspace = config.project.navspaces[i];
			var arr = libObject.getsByKey(config, navspace);
			for(var j in arr){
				var type = arr[j].type;
				if(!type) continue;
				types.push(type);
				if(arr[j].mods) 
					for(var k in arr[j].mods){
						if(!mods[type]) mods[type] = [];
						mods[type].push(arr[j].mods[k]);
					}
			}
		}
	
	for(var i in types){
		var type = types[i];
		if(fs.existsSync(archSrc + "/" + type))
			addPath(paths, archSrc + "/" + type);
		for(var j in mods[type]){
			var mod = mods[type][j];
			if(fs.existsSync(archSrc + "/" + type + "-" + mod))
				addPath(paths, archSrc + "/" + type + "-" + mod);
		}
	}
/*
	var scriptFile = path.resolve(archRoot + "/load.js");
	if(!fs.existsSync(scriptFile)){
		log.i("no script file " + scriptFile);
		log.i("use " + archRoot);
		paths = [];
		if(fs.existsSync(archSrc))
			paths.push(archSrc);
	}else{
		config.env.archSrcDir = archSrc;
		var res = require(scriptFile)(config);
		if(res)
			paths = res;
		else{
			log.e("get path error: " + scriptFile);
			return 0;
		}
	}
*/
	if(config.project.navpaths && config.project.navpaths.length)
		config.project.navpaths.forEach(function(navpath){
			addPath(paths, navpath);
		});
	paths.push(".");
	return paths;
}
function addPath(paths, p){
  if(fs.existsSync(p)){
    libArray.pushIfNotExists(paths, path.resolve(p));
  }
}

