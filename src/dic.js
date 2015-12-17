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
module.exports  ={
	get: get
}
function get(word, scope, json){
	var self = this;
	var cache = self.itpCache;
	var dicDir = self.global.dicDir;
	for(var i = 0; i<=scope.length*2; i++){
		var scopePath = makePath(scope, i);
		var wordPath = scopePath + "/" + word;
		if(fs.existsSync(dicDir + wordPath)){
// get the word
			if(cache[wordPath])
				return cache[wordPath];
			var config = readWord.call(self, wordPath, json);
			cache[wordPath] = config;
			return config;
		}
	}
}
function makePath(scope, i){
	if(i == scope.length)
		return "";
	var arr;
	if(i<scope.length)
		arr = scope.slice(0, scope.length-i);
	else
		arr = scope.slice(i-scope.length, scope.length);
	var str = "";
	arr.forEach(function(e){
		str += "/"+e+"";
	});
	return str;
}
function readWord(dir, json){
	var self = this;
	var formatCache = self.formatCache;
	var dicDir = self.global.dicDir;
	var config = {};
	if(fs.existsSync(dicDir + dir + "/format.json"))
		config.format = libFile.readJSON(dicDir + dir +"/format.json");
	else
		config.format = {};
	if(fs.existsSync(dicDir + dir + "/extend.json"))
		try{
      config.extend = JSON.parse(
        tmpl.render({
          file: dicDir + dir +"/extend.json"
        }, {
					json: json
				}, true));
    }catch(e){
      log.e("parse " + dir + "/disp.render.json error");
      return 1;
    }
	else
		config.extend = {};	
	return config;
}
