var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var sync = require("../lib/js/sync");
var utils =require("./utils");
var log = require("../lib/nodejs/log");
//var dic = require("./dic");
var Tree = require("./tree");
var Dic = require("./dic");

var tmpl = require("./tmpl");
module.exports = Disp;
function Disp(fn){
	var self = this;
	self.callback = fn;
}

Disp.prototype.run = function(){
	var self = this;
	if(!self.callback) self.callback = function(err){
		if(err) throw err;
		else log.i("done");
	}
	self.parseArgv();
	self.readJson();
	self.setGlobal();
//	self.setContent();
	self.readPrev();
	self.setFilelist();
	self.genCode();
	self.dispose();
}
Disp.prototype.parseArgv = function(){
	var self = this;
	//init global
	var env = {};
	env.nodeBin = process.argv.shift();
	env.dispBin = process.argv.shift();
	env.argv = [];
	var ParamsHelp = {
		"p": "project path, default '.'",
		"t": "target path, default '.', can be configured in disp.json",
		"v": "verbose mode"
	}
	var op = process.argv.shift();
	var projectDir;
	while(op){
		switch(op){
			case "-p":
			projectDir = path.resolve(process.argv.shift());
			break;
			case "-t":
			env.targetDir = path.resolve(process.argv.shift());
			break;
			case "-v":
			log.setLevel(3);
			log.v("verbose mode enabled");
			break;
			case "-h":
			self.callback(libString.makeArgvHelp(ParamsHelp));
			break;
			default:
			env.argv.push(op);
		}
		op = process.argv.shift();
	}
	if(!projectDir) projectDir = path.resolve(".");
	env.projectDir = projectDir;
	env.dispDir = path.resolve(__dirname + "/..");
	env.dicDir = path.resolve(__dirname + "/../dic");
	env.implDir = path.resolve(__dirname + "/../impl");
	env.archDir = path.resolve(__dirname + "/../arch");
	env.langDir = path.resolve(__dirname + "/../lang");
	env.target = ".";
	log.v(env);
	self.env = env;
}
Disp.prototype.readPrev = function(){
	var self = this;
	var prev = {};
	if(fs.existsSync(self.env.projectDir + "/disp.filelist.json"))
		prev.filelist = libFile.readJSON(self.env.projectDir + "/disp.filelist.json");
	else
		prev.filelist = {};
	log.v(prev);
	self.prev = prev;
}
Disp.prototype.readJson = function(){
	var self = this;
	//init src
	if(!fs.existsSync(self.env.projectDir + "/disp.json")){
		log.e("no disp.json");
		return self.callback("no disp json");
	}
	self.dispJson = libFile.readJSON(self.env.projectDir + "/disp.json");
	log.v("read json success");
	log.v(self.dispJson);
	
}
Disp.prototype.setGlobal = function(){
	var self = this;
	self.global = {
		entityL: {
			stepA: []
		}
	};
	var dic = new Dic([self.env.dicDir]);
	var tree = new Tree("disp", self.dispJson, self.global, self.global);
	try {
		tree.parse(dic);
	}catch(e){
		return self.callback(e);
	}
	if(!self.global.arch)
		self.global.arch = "raw";
	if(!self.global.impl)
		self.global.impl = "nodejs";
//	self.readImplDeps();
	log.v(self.global);
}
Disp.prototype.readImplDeps = function(){
	var self = this;
	var implPath = self.env.implDir + "/" + self.global.impl;
	if(fs.existsSync(implPath + "/define.js")){
		var config = require(implPath + "/define.js");
		
	}
}
Disp.prototype.setContent = function(){
	var self = this;
	self.content = {};
	var dic = new Dic([self.env.implDir + "/" + self.global.impl]);
	var tree = new Tree("disp", self.global.entityL, self.content, self.content);
	try {
		tree.parse(dic);
	}catch(e){
		return self.callback(e);
	}
	
	
}
Disp.prototype.setFilelist = function(){
	var self = this;
	var configFile = self.env.archDir + "/" + self.global.arch + "/" + self.global.impl;
	var tmpFileList;
	try {
		tmpFileList = require(configFile);
	}catch(e){
		self.callback(e);
	}
	self.filelist = tmpFileList;
}
Disp.prototype.genCode = function(){
	var self = this;
	var filelist = self.filelist;
  for (var orifilename in filelist){
    var partConfig = filelist[orifilename];
    var filename = self.env.target + "/" + orifilename;
    libFile.mkdirpSync(path.dirname(filename)); //to be acc
/*todo sync*/
/**/
    var str = "";
    if(partConfig.content){
			var c = self.global.entityL[partConfig.content];
			for(var i in c){
				str += self.eval(c[i], partConfig.lang);
			}
    }
    if(fs.existsSync(filename))
      fs.unlinkSync(filename);
    fs.writeFileSync(filename, str, {mode: 0444});
  }
}
Disp.prototype.dispose = function(){
	log.v("dispose success");
}
Disp.prototype.eval = function(json, lang){
	var self = this;
	var name = Object.keys(json)[0];
	var file = self.env.langDir + "/" + lang + "/" + name;
	return tmpl.render({file: file}, {
		"argv": json[name]
	});

}
