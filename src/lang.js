var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var utils =require("./utils");
module.exports = {
	readLangs: readLangs
}
function readLangs(){
	var self = this;
	var projectJson = self.project;
	if(!projectJson.langs) projectJson.langs = {"nodejs": 1};
	for(var lang in projectJson.langs){
		var langDir = self.rootDir + "/lang/" + lang;
		if(!fs.existsSync(langDir))
			return self.error("no langDir: " + langDir);
		log.v("lang: " + lang);
		//iterate deps and read formats
		if(readLang.call(self, lang)) return 1;
	}
}
function readLang(lang){
	var self = this;
	var langDir = self.rootDir + "/lang/" + lang;	

//read lang.json
	var langJson = {};
	if(fs.existsSync(langDir + "/lang.json"))
		langJson = libFile.readJSON(langDir + "/lang.json");
	if(!langJson.types)
		return self.error(lang + " no types in lang.json");
	self.langs[lang] = langJson;
	for(var type in langJson.types){
		if(!self.types[type]) self.types[type] = [];
		libArray.pushIfNotExists(self.types[type], lang);
	}

//iterate deps
	if(langJson.deps){
		for(var dep in langJson.deps){
			readLang.call(self, dep);
		}
	}
}

