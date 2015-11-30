var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var utils =require("./utils");
var tmpl = require("./tmpl");
var format = require("./format");
var checkName = require("./utils").checkName;
var log = require("./log");
module.exports = {
	initGlobal: initGlobal,
	formatGlobal: formatGlobal
}
function initGlobal(){
	var self = this;
	var config = self.config;
	//the dir contains your project and project.json
	self.projectDir = config.projectDir || path.resolve(".");

	//the dir contains disp librarys
	self.rootDir = config.rootDir || path.resolve(__dirname + "/..");

	//select the task;
	self.task = config.task || "main";

	//read previous file list
	if(fs.existsSync(self.projectDir + "/disp.filelist.json"))
		self.prevFilelist = libFile.readJSON(self.projectDir + "/disp.filelist.json");

	//global from disp.json
	if(!fs.existsSync(self.projectDir + "/disp.json"))
		return self.error("no disp.json");
	self.global = libFile.readJSON(self.projectDir + "/disp.json");
	self.global.bin = process.argv[1];
	self.global.pwd = process.env.PWD;
	self.global.rootDir = self.rootDir;
  if(self.task != "main")
    utils.extend(self.global, libFile.readJSON(self.task + ".json"));

	//project is global.project
	self.project = self.global.project || {};

	self.formats = {};
	self.froms = {};
	self.tmpls = {};
	self.libs = {};
	self.srcs = {};
	self.archs = {};
	self.langs = {};
	self.types = {};
	self.navpaths = {};
	self.prevFilelist = {};
	self.filelist = {};
}
function formatGlobal(){
	var self = this;
	mountJSON(self.global);
	mountString(self.global);
	if(format.format.call(self, "global", self, self.formats))
		return 1;

//format target path
  self.project.target = path.relative(".", self.project.target) || ".";
	if(!self.project.fsconfigs) self.project.fsconfigs = {};
//add internal fsconfigs
	//if target is not "." add target ignore to fsconfigs
	var fsconfigs = self.project.fsconfigs;
  if(self.task != "main")
		libObject.setIfEmpty(fsconfigs, self.task + ".json", {ignore: true});
	if(self.project.target != "."){
		var target = path.relative(".", self.project.target);
		libObject.setIfEmpty(fsconfigs, target, {ignore: true});
	}
	return 0;
}
function mountJSON(config, dir){
	if(!dir) dir= ".";
	libObject.iterate(config, function(key, itConfig, i){
    var e;
    if(i==undefined)
      e = itConfig[key];
    else
      e = itConfig[key][i];

    if(e[0] == "@" && e[1] == "@"){
			var arr = e.substr(2).split("@");
      var jpath = path.resolve(dir + "/" +arr[0]);
      var json = libFile.readJSON(jpath);
			if(arr[1])
				json = libObject.getByKey(json, arr[1]);
      mountJSON(json, path.dirname(jpath));
      if(i==undefined)
        itConfig[key] = json;
      else
        itConfig[key][i] = json;
    }
  });
}
function mountString(config){
	libObject.iterate(config, function(key, itConfig, i){
    var e;
    if(i==undefined)
      e = itConfig[key];
    else
      e = itConfig[key][i];
		var setnew = 0;
		if(typeof e == "string" && e.match(/\^\^.+\$\$/)){
			e = tmpl.render(e, itConfig, true);
			setnew = 1;
		}
		if(key.match(/\^\^.+\$\$/)){
			var tmpkey = tmpl.render(key, itConfig, true);
			delete itConfig[key];
			if(i!=undefined && !itConfig[tmpkey]) itConfig[tmpkey] = [];
			key = tmpkey;
			setnew = 1;
		}
		if(setnew){
			if(i==undefined)
				itConfig[key] = e;
			else
				itConfig[key][i] = e;
		}
	});
}
