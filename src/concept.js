var libObject = require("../lib/js/object");
var libArray = require("../lib/js/array");
var libString = require("../lib/js/string");
var fs = require("fs");
var tmpl = require("./tmpl");
var libFile = require("../lib/nodejs/file");
var log = require("../lib/nodejs/log");
var utils = require("./utils");
module.exports = {
	eval: _eval,
	get: get
}
function get(name, impls){
	var self = this;
	var implCache = self.implCache;
	var implDir = self.global.implDir;
	for(var i in impls){
		var key = impls[i] + "/" + name;
		if(implCache[key]) return implCache[key];
		var file = implDir + "/" + key;
		if(fs.existsSync(file)){
			implCache[key] = libFile.readString(file);
			return implCache[key];
		}
	}
}
function _eval(json, impls){
	var self = this;
	var name = Object.keys(json)[0];
	if(!name)
		log.e(libObject.stringify(json) + " cannot be evaled");
	return tmpl.render(get.call(self, name, impls), {params: json[name]});
}
