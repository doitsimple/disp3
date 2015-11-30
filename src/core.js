var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var utils =require("./utils");
var nav = require("./nav");
var walk = require("./walk");
var arch = require("./arch");
var lang = require("./lang");
var tmpl = require("./tmpl");
var env = require("./env");
var concept = require("./concept");
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
	self.config = config;
	var dead = false;
	self.error = function(){
		dead = true;
		errorFn.apply(self, arguments);
		return 1;
	};
	var steps = {
		"initGlobal": env.initGlobal, //generate global
		"readLangs": lang.readLangs, //read all archs
		"readArchs": arch.readArchs, //read all archs
		"formatGlobal": env.formatGlobal, //format global
		"getNavPaths": nav.getNavPaths, //get navpaths
		"readDispJsons": walk.readDispJsons, //read all disp.json
		"readFileList": walk.readFileList, //read all file list
		"initConcept": concept.initConcept, //init concept
		"genFiles": gen.genFiles, //generate all files,
		"postRun": post.run //execute script 
	}
	for(var step in steps){
		if(dead) break;
		log.i(step);
		if(!steps[step].apply(self))
			log.i("->success");
		else{
			log.i("->error");
			return;
		}
	}
}

