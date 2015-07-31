var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");

var format = require("./format");
var nav = require("./nav");
var walk = require("./walk");
var tmpl = require("./tmpl");
var gen = require("./gen");
var post = require("./post");
var log = require("./log");

module.exports = Disp;
function Disp(){
	var config, errorFn;
	switch(arguments.length){
		case 0:
		config = {}, errorFn = function(err){ log.e(err); return 1;};
		break;
		case 1:
		config = {}, errorFn = arguments[0];
		break;
		case 2:
		config = arguments[0], errorFn = arguments[1];
		break;
		default:
		log.e("Disp with wrong args");
	}
	var self = this;
	//the dir contains your project and project.json
	self.projectDir = config.projectDir || path.resolve(".");
	//the dir contains disp librarys
	self.rootDir = config.rootDir || path.resolve(__dirname + "/..");
	//select the task;
	self.task = config.task || "main";
	
	self.global = {};
	self.formats = {};
	self.froms = {};
	self.tmpls = {};

	self.archs = {};
	self.navpaths = {};
	self.prevFilelist = {};
	self.filelist = {};
	var dead = false;
	self.error = function(){
		dead = true;
		errorFn.apply(self, arguments);
		return 1;
	};
	var steps = {
		"readConfigs": format.readConfigs, //generate global
		"getNavPaths": nav.getNavPaths, //get navpaths
		"readFileList": walk.readFileList, //read all file list
		"extendConfigs": format.extendConfigs, //extend global,
		"genFiles": gen.genFiles, //generate all files,
		"postRun": post.run //execute script 
	}
	for(var step in steps){
		if(dead) break;
		log.i(step);
		steps[step].apply(self);	
	}
}

/*
*/
function run(){
	var self = this;
	var configCache = cache.config;
	configCache.format = cache.format;
	configCache.env = {};
	configCache.env.rootDir = rootDir;
	var formatCache = cache.format;
	if(task && task != "main"){
		libObject.extend(configCache, libFile.readJSON(task + ".json"));
	}
	configCache.project.bin = path.resolve(__dirname + "/../bin/disp3");
	configCache.project.target = path.relative(".", configCache.project.target);
	if(configCache.project.target == "") configCache.project.target = ".";
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
//extend twice
	if(task && task != "main"){
		libObject.extend(configCache, libFile.readJSON(task + ".json"));
	}
	
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

