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
	_eval: _eval
}
function _eval(json, config){
	
}
// intepret src
function itpSrc(fn){
	var self = this;
	itp.call(self, self.src, [], fn);
}
/*
scope is originally []

*/

function itp(src, scope, fn){
	var self = this;
	for(var key in src){
		var config = dic.get.call(self, key, scope, src[key]);
		if(!config)
			return fn("itp failed: " + key);
		if(format.format.call(self, key, src, config.format))
			return log.e("format failed");
		utils.extend(self, config.extend);		
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
