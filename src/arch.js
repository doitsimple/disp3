var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var utils =require("./utils");
module.exports = {
	readArchs: readArchs
}

function readArchs(){
	var self = this;
	var projectJson = self.project;
	if(!projectJson.arch) projectJson.arch = "base";
	var archDir = self.rootDir + "/arch/" + projectJson.arch;
	if(!fs.existsSync(archDir))
		return self.error("no archDir: " + archDir);
	log.v("arch: " + projectJson.arch);
//iterate deps and read formats
	if(readArch.call(self, projectJson.arch)) return 1;
	//base arch is load by default
	if(!self.formats["base"])
		if(readArch.call(self, "base")) return 1;
}
function readArch(arch){
	var self = this;
	var archDir = self.rootDir + "/arch/" + arch;	
	var projectJson = self.global.project;

//read format.json
	var formatJson = {};
	if(fs.existsSync(archDir + "/format.json"))
		formatJson = libFile.readJSON(archDir + "/format.json");
	libObject.append(self.formats, formatJson);

//read arch.json
	var archJson = {};
	if(fs.existsSync(archDir + "/arch.json"))
		archJson = libFile.readJSON(archDir + "/arch.json");
	self.archs[arch] = archJson;

//iterate deps
	if(archJson.deps){
		for(var dep in archJson.deps){
			readArch.call(self, dep);
		}
	}
}

