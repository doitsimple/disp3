var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var sync = require("../lib/js/sync");
var utils =require("./utils");
var log = require("../lib/nodejs/log");
var methods = {};
libObject.extend1(methods, libString);
libObject.extend1(methods, libArray);
libObject.extend1(methods, libObject);
libObject.extend1(methods, libFile);
var tmpl = require("./tmpl");
/*
var format = require("./format");
var walk = require("./walk");
var dic = require("./dic");
*/
module.exports = Tree;
function Tree(key, branch, local, global){
	var self = this;
	self.key = key;
	self.branch = branch;
	self.local = local;
	self.global = global;
}
Tree.prototype.parse = function(dic){
	var self = this;
	var def = dic.get(self.key, []);
	if(def.parse){
		def.parse(self.branch, self.local, self.global, methods);
	}	
	if(def.extendGlobal){
		utils.extend(self.global, def.extendGlobal);
	}
	if(def.flagLeaf){
		return;
	}
	if(def.flagExpand){
		for(var key in self.branch){
			var local;
			if(def.flagExpandParent)
				local = self.local;
			else{
				self.local[key] = {};
				local = self.local[key];
			}
			var branch = new Tree(key, self.branch[key], local, self.global);
			branch.parse(dic);
		}
	}
}
