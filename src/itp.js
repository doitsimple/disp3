var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var sync = require("../lib/js/sync");
var utils =require("./utils");
var log = require("../lib/nodejs/log");

var tmpl = require("./tmpl");
var format = require("./format");
var walk = require("./walk");
var dic = require("./dic");
module.exports  ={
	itpSrc: itpSrc,
	itpConfig: itpConfig
}
function itpConfig(){
	
}
// intepret src
function itpSrc(fn){
	var self = this;
	itp.call(self, self.src, [], fn);
}
/*
scope is originally []

*/
var formatCache = {};

function itp(src, scope, fn){
	var self = this;
	for(var key in src){
		var scopeDir = dic.getPr.call(self, key, scope);
		scope.push(key);
		var wordDir = scopeDir + "/" + key;
		var json = src[key];
		if(!formatCache[wordDir]){
			if(fs.existsSync(wordDir + "/format.json"))
				formatCache[wordDir] = libFile.readJSON(wordDir+"/format.json");
			else
				formatCache[wordDir] = {};
		}
		if(format.format.call(self, key, src, formatCache[wordDir]))
			return fn("format failed");
		if(getArch.call(self, wordDir, json))
			return fn("read arch failed");
	}
	log.v("interpret success");
	fn();
}
function getArch(dir, json){
	var self = this;
	for(var key in json.arch){		
// dep sequence
		var subdir = dir + "/ar/" + key;
		if(fs.existsSync(subdir)){
			if(walk.walk.call(self, subdir, ""))
				return 1;
		}
	}
}
