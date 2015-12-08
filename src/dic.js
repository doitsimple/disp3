var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var sync = require("../lib/js/sync");
var utils =require("./utils");
var log = require("../lib/nodejs/log");

module.exports  ={
	getPr: getPr
}
var cache = {};
function getPr(word, scope){
	var self = this;
	var dicDir = self.global.dicDir;
	for(var i = 0; i<=scope.length*2; i++){
		var scopePath = makePath(scope, i);
		if(!scopePath || fs.existsSync(scopePath)){
// get the word
			if(!cache[scopePath])
				cache[scopePath] = readPrs(dicDir + "/pr" + scopePath);
			if(cache[scopePath][word]){
				return cache[scopePath][word];
			}
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
		str += "/"+e+"/pr";
	});
	return str;
}
function readPrs(dir){
	var list = libFile.readdirNotFileSync(dir);
	var dirCache = {};
	for(var i in list){
		var name = list[i];
		if(!utils.checkName(name)) 
			continue;
		dirCache[name] = dir;
	}
	return dirCache;
}
