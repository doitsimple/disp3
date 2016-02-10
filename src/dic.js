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
module.exports = Dic;
function Dic(paths){
	var self = this;
	self.paths = paths;
	self.cache = {};
}
Dic.prototype.get = function(key, scope){
	var self = this;
	for(var i in self.paths){
		var dicDir = self.paths[i];
		for(var i = 0; i<=scope.length*2; i++){
			var scopePath = makePath(scope, i);
			var wordPath = scopePath + "/" + key;
			if(fs.existsSync(dicDir + wordPath + ".js")){
				// get the word
				if(self.cache[wordPath])
					return self.cache[wordPath];
				var configFunc;
				try{
					configFunc = require(dicDir + wordPath +".js");
					self.cache[wordPath] = configFunc;
				}catch(e){
					log.e(dicDir+wordPath + ".js error");
					return null;
				}
				return configFunc;
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
		str += "/"+e+"";
	});
	return str;
}

