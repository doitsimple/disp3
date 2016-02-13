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
	self.readPrev();
	self.readArch();
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
		entity: {},
		config: {}
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

	log.v(self.global);
}


Disp.prototype.readArch = function(){
	var self = this;
	//file struct
	var configFile = self.env.archDir + "/" + self.global.arch + "/" + self.global.impl;
	//global
	var configFile2 = self.env.archDir + "/" + self.global.arch;
	var tmp, tmp2;
	try {
		tmp = require(configFile);
	}catch(e){
		self.callback(e);
	}
	try {
		tmp2 = require(configFile2);
	}catch(e){
		self.callback(e);
	}
	if(tmp2){
		utils.append(self.global, tmp2);
	}
// make content link for lib func
/////////////////////
	self.contentLinks = {};
	for(var key in tmp){
		var content = tmp[key].content;
		self.contentLinks[content] = key;
	}
/////////////////////
	log.v(tmp);
	self.filelist = tmp;
	self.fileroot = configFile;
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
		var deps = {};
		var c;
		if(partConfig.code || partConfig.content){
			if(partConfig.code)
				c = partConfig.code;
			if(partConfig.content)
				c = self.global.entity[partConfig.content];
			if(libObject.isArray(c)){
				for(var i in c){
					str += self.eval(c[i], partConfig.lang, deps);
				}
			}else if(c){
				str += self.eval(c, partConfig.lang, deps);
			}
    }
		if(partConfig.tmpl){
			var env;
			if(!partConfig.env) env = self.global;
			else{
				env = libObject.getByKey(self.global, partConfig.env);
				env.global = self.global;
				env.main = str;
			}
			tmpl.extendMethods("eval", function(json){
				return self.eval(json, partConfig.lang, deps);
			});
			str = tmpl.render({
				file: self.fileroot + "/" + partConfig.tmpl
			}, env);
		}

//parse deps
/////////////////////////////////
		if(partConfig.lib){
// if has lib, require lib and add func to lib
			var requires = {};
			for(var key in deps){
				if(!self.global.entity[partConfig.lib])
					self.global.entity[partConfig.lib] = {};
				var libs = self.global.entity[partConfig.lib];
				if(!libs.exports)
					libs.exports = {};
				if(!libs.exports[key]) libs.exports[key] = 1;
				requires[deps[key]]++;
			}
			for(var key in requires){
				str = self.eval({"require": {name: key, file: self.contentLinks[partConfig.lib]}}, partConfig.lang, deps) + str;
			}
		}else{
// else add func in this file
			for(var key in deps){
				str = self.eval(key + ".lib", partConfig.lang, deps) + str;
			}
		}
//////////////////////////////

    if(fs.existsSync(filename))
      fs.unlinkSync(filename);
    fs.writeFileSync(filename, str, {mode: 0444});
  }
}
Disp.prototype.dispose = function(){
	log.v("dispose success");
}
// simple methods
var cache = {};

Disp.prototype.getLangConfig = function(lang){
	var self = this;
	var configFile = self.env.langDir + "/" + lang;
	if(cache[lang])
		return cache[lang];
	var config = {};
	try {
		config = require(configFile);
	}catch(e){
		self.callback(e);
	}
	cache[lang] = config;
	return config;
}

Disp.prototype.getLangFile = function(name, lang){
	var self = this;
	var langConfig = self.getLangConfig(lang);
	var file = self.env.langDir + "/" + lang + "/" + name;
	var resultFile;
	if(fs.existsSync(file)){
		return file;
	}else{
		for(var key in langConfig.deps){
			var tmpfile = self.getLangFile(name, key);
			if(tmpfile)
				return tmpfile;
		}
	}
}

Disp.prototype.eval = function(json, lang, deps){
	var self = this;
	if(typeof json == "string"){
		var tmp = {};
		tmp[json] = 1;
		json = tmp;
	}
	console.log(json);
	var name = Object.keys(json)[0];
	var file = self.getLangFile(name, lang);
	if(!file){
		self.callback(lang + " " + name + " not exist");
	}
	if(json[name].eval || json[name].init || json[name].get){
		var str = self.eval(json[name], lang, deps);
		json[name] = str;
	}
	tmpl.extendMethods("eval", function(json){
		return self.eval(json, lang, deps);
	});
	var data = {
		argv: json[name],
		deps: deps,
		parent: json,
		global: self.global
	}
	
	return tmpl.render({file: file}, data);
}
