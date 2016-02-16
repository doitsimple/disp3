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
module.exports = Disp;
function Disp(config, fn){
	var self = this;
	if(!fn) fn = function(err){
		if(err) throw err;
		else log.i("done");
	}
	self.callback = fn;

	self.global = {};
	if(config)
		utils.extend(self, config);
	if(!self.projectDir)
		self.projectDir = path.resolve(".");
	if(!self.targetDir)
		self.targetDir = ".";
}

Disp.prototype.run = function(){
	var self = this;
	self.extendEnv();
	self.extendGlobal();
	self.readPrev();
	self.readArch();
	self.genProj();
	self.dispose();
}
Disp.prototype.extendEnv = function(){
	var self = this;
	self.env = {};
	self.env.nodeBin = process.argv.shift();
	self.env.dispBin = process.argv.shift();
	self.env.dispDir = path.resolve(__dirname + "/..");
	self.env.archDir = path.resolve(self.env.dispDir + "/arch");
	self.env.langDir = path.resolve(self.env.dispDir + "/lang");
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

Disp.prototype.extendGlobal = function(){
	var self = this;

	if(fs.existsSync(self.projectDir + "/disp.json")){
		var dispJson = libFile.readJSON(self.projectDir + "/disp.json");
		log.v("read json success");
		log.v(dispJson);

		utils.extend(self.global, dispJson);
	}
	if(!self.global.arch)
		self.global.arch = "raw";
	if(!self.global.impl)
		self.global.impl = "nodejs";
	log.v("global");
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
Disp.prototype.genProj = function(){
	var self = this;
	var filelist = self.filelist;
  for (var orifilename in filelist){
    var partConfig = filelist[orifilename];
		//target filename
		if(orifilename.match(/\^\^.*\$\$/)){
			var env;
			if(partConfig.envkey){
				env = libObject.getByKey(self.global, partConfig.envkey);
				partConfig.env = env;
			}
			else if(partConfig.env)
				env = partConfig.env;
			else
				env = self.global;
			var tfilename;
			if(typeof env != "object"){
				tfilename = self.targetDir + "/" + tmpl.render(orifilename, {argv: env});
				self.genFile(partConfig, tfilename);
			}else{
				for(var key in env){
					tfilename = self.targetDir + "/" + 
								tmpl.render(orifilename, {argv: key, env: env[key]});
					var newPartConfig = libObject.copy1(partConfig);
					newPartConfig.env = partConfig.env[key];
					self.genFile(newPartConfig, tfilename);
				}
			}
		}else{
			self.genFile(partConfig, self.targetDir + "/" + orifilename);
		}
  }
}
Disp.prototype.dispose = function(){
	log.v("dispose success");
}
Disp.prototype.genFile = function(partConfig, filename){
	var self = this;
	if(partConfig.arch){
		var config = {
			projectDir: path.resolve(filename),
			targetDir: filename,
			global: {
				arch: partConfig.arch
			}
		}
		if(partConfig.impl)
			config.global.impl = partConfig.impl;
		if(partConfig.env)
			utils.extend(config.global, partConfig.env);
		console.log(config.global);
		var newDisp = new Disp(config, self.callback);
		newDisp.run();
		return;
	}
  libFile.mkdirpSync(path.dirname(filename)); //to be acc
	/*todo sync*/
	/**/
  var str = "";
	var deps = {};
	if(partConfig.code || partConfig.content){
		var c;
		if(partConfig.code)
			c = partConfig.code;
		if(partConfig.content)
			c = self.global[partConfig.content];
		if(c)
			str += self.eval(c, partConfig.lang, deps);
  }
	var env;
	if(partConfig.envkey || partConfig.env){
		if(partConfig.env){
			env = partConfig.env;
		}else	if(partConfig.envkey){
			env = libObject.getByKey(self.global, partConfig.envkey);
		}
		env.global = self.global;
		env.main = str;
	}
	if(!env) env = self.global;
	if(partConfig.raw){
		str += tmpl.render(partConfig.raw, env);
	}
	if(partConfig.tmpl || partConfig.src){
		tmpl.extendMethods("eval", function(json){
			return self.eval(json, partConfig.lang, deps);
		});
		var srcfile;
		if(partConfig.tmpl)
			srcfile = self.fileroot + "/" + partConfig.tmpl;
		else if(partConfig.src)
			srcfile = self.projectDir + "/" + partConfig.src;
		str = tmpl.render({
			file: srcfile
		}, env);
	}

	//parse deps
	/////////////////////////////////
	if(partConfig.lib){
		// if has lib, require lib and add func to lib
		var requires = {};
		for(var key in deps){
			//TODO mutilayer support
			if(!self.global[partConfig.lib]) //init
				self.global[partConfig.lib] = {};
			var libs = self.global[partConfig.lib];
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
	var type = typeof json;
	var str = "";
	if(type === "string"){
		var tmp = {};
		tmp[json] = 1;
		json = tmp;
	}else if(type == "number"){
		return json;
	}else if(type == "object"){
		if(libObject.isArray(json)){
			for(var i in json){
				json[i].index = i;
				str += self.eval(json[i], lang, deps);
			}
			return str;
		}
	}
	console.log(json);
	var name = Object.keys(json)[0];
	if(name[0] == "L"){
		for(var key in json){
			var truename = name.substr(1);
			var tmpjson = {};
			tmpjson[truename] = json[key];
			tmpjson.name = truename;
			str += self.eval(tmpjson, lang, deps);
		}
		return str;
	}
//begin eval
	var file = self.getLangFile(name, lang);
	if(!file){
		self.callback(lang + " " + name + " not exist");
	}
/*
	if(json[name].eval || json[name].val || json[name].get){
		var str = self.eval(json[name], lang, deps);
		json[name] = str;
	}
*/
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
