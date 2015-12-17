var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("../lib/nodejs/log");
module.exports = {
	implGlobal: implGlobal
}
function implGlobal(fn){
	var self = this;
	var implCache = self.implCache;
	if(!self.global.impls)
		self.global.impls = ["js", "nodejs"];
	log.v("implement success");
	fn();
}
