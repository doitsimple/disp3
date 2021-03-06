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
	self.global = {
		"arch": "base",
		_isGlobal: true,
		dev: 1
	};
	self.fileMap = {};
	self.fileCount = 0;
	if(config)
		utils.extend(self, config);
	if(!self.projectDir)
		self.projectDir = path.resolve(".");
}

Disp.prototype.run = function(){
	var self = this;
	self.extendGlobal();
//	self.readPrev();
	self.genArch();
	self.genPlugin();
	self.dispose();
}

Disp.prototype.readDispJson = function(jsonFile, config){
	var self = this;
	if(!fs.existsSync(self.projectDir + "/" + jsonFile)){
		log.i("ignore " + self.projectDir + "/" + jsonFile);
		return;
	}

	tmpl.extendMethods("eval", function(json){
		return self.eval(json, self.global.arch);
	});
	var env;
	if(config && config.mount){
		env = libObject.getByKey(self.global, config.mount);
		if(!env){
			env = {};
			libObject.setByKey(self.global, config.mount, env);
		}
	}else{
		env = self.global;
	}
	var str = tmpl.render({file: self.projectDir + "/" + jsonFile}, {global: self.global, env: env});
	var toextend;
	try {
		toextend = JSON.parse(str);
	}catch(e){
		log.i(jsonFile);
		JSON.parse(str);
	}
	if(config && config.mount){
		var sub = libObject.getByKey(self.global, config.mount);
		utils.extend(sub, toextend);
	}else{
		utils.extend(self.global, toextend);
	}
	
}
Disp.prototype.extendGlobal = function(){
	var self = this;
	self.global.dispDir = path.resolve(__dirname + "/..");
	self.global.archDir = path.resolve(self.global.dispDir + "/arch");
	self.global.pluginDir = path.resolve(self.global.dispDir + "/plugin");
	self.global.langDir = path.resolve(self.global.dispDir + "/lang");
	self.global.projectDir = self.projectDir;
	if(!self.global.baseDir){
		self.global.baseDir = self.projectDir;
	}
	if(!self.ignoreDispJson){
		self.readDispJson("disp.json");
		if(self.exDispJsonFile){			
			if(!self.exDispJsonFile.match(/\.json$/))
				self.exDispJsonFile = self.exDispJsonFile + ".json";
			self.readDispJson(self.exDispJsonFile);
		}
		if(fs.existsSync(self.projectDir + "/disp")){
			libFile.forEachFile(self.projectDir + "/disp", function(f){
				if(!f.match(/\.json$/)) return;
				self.readDispJson("disp/"+f);
			});
			libFile.forEachDir(self.projectDir + "/disp", function(f){
				var config;
				if(fs.existsSync("disp/"+f+"/index.json")){
					config = libFile.readJson("disp/"+f+"/index.json");
				}
				libFile.forEachFile(self.projectDir + "/disp/"+f, function(subf){
					if(!subf.match(/\.json$/)) return;
					if(subf == "index.json") return;
					self.readDispJson("disp/"+f+"/"+subf, config);
				});
			});
		}		
		if(self.exDispJsonFile){			
			if(!self.exDispJsonFile.match(/\.json$/))
				self.exDispJsonFile = self.exDispJsonFile + ".json";
			self.readDispJson(self.exDispJsonFile);
		}
	}
	if(self.global.targetDir)
		self.targetDir = self.global.targetDir;
	if(!self.targetDir)
		self.targetDir = ".";
	if(!self.global.targetDir)
		self.global.targetDir = self.targetDir;
	if(!self.global.targetBaseDir){
		self.global.targetBaseDir = self.targetDir;
	}

	if(!self.global.arch)
		self.global.arch = "raw";
	if(!self.global.impl)
		self.global.impl = "basic";
	log.v("extend global done");
}
Disp.prototype.genArch = function(){
	var self = this;

	var archConfigFile = self.global.archDir + "/" + self.global.arch;
	var archConfig;
	try {
		archConfig = require(archConfigFile);
	}catch(e){
		self.callback(e);
	}
	if(archConfig){
		utils.append(self.global, archConfig);
	}
	//file struct
	var genConfigFile = self.global.archDir + "/" + self.global.arch + "/" + self.global.impl;
	//global
	var filelist;
	try {
		filelist = require(genConfigFile);
	}catch(e){
		self.callback(e);
	}
	if(self.global.addons){
		utils.extend(filelist, self.global.addons);		
	}
	self.genProj(filelist, {
		src: genConfigFile,
		target: ""
	});
}
Disp.prototype.genProj = function(filelist, config){
	var self = this;
	self.genProjSub(filelist, {
		src: config.src,
		target: config.target,
		isPseudo: 1
	});
	self.genProjSub(filelist, {
		src: config.src,
		target: config.target
	});
}
Disp.prototype.genProjSub = function(filelist, config){
	var self = this;
	log.v("genProjSub");
  for (var orifilename in filelist){
    var partConfig = filelist[orifilename];
		if(libObject.isArray(partConfig)){
			for(var i in partConfig){
				self.genFilePre(path.join(config.target,orifilename), partConfig[i], config);
			}
		}else{
			self.genFilePre(path.join(config.target, orifilename), partConfig, config);
		}
  }
}
Disp.prototype.genFilePre = function(orifilename, partConfig, config){
	var self = this;
	log.v("genFilePre "+orifilename);
	if(orifilename.match(/\^\^.*\$\$/)){
		var env = self.getEnv(partConfig);
		var tfilename;
		var newPartConfig;
		if(!orifilename.match(/argv/)){
			tfilename = tmpl.render(orifilename, {global: env});
			newPartConfig = libObject.copy1(partConfig);
			if(partConfig.name)
				newPartConfig.name = tmpl.render(partConfig.name, {global: env});
			self.genFile(newPartConfig, tfilename, config);
		}else{
			if(typeof env != "object"){
				tfilename = tmpl.render(orifilename, {argv: env});
				newPartConfig = libObject.copy1(partConfig);
				if(partConfig.name)
					newPartConfig.name = tmpl.render(partConfig.name, {argv: env});
				self.genFile(newPartConfig, tfilename, config);
			}else{
				for(var key in env){
					var localenv = {
						argv: key, 
						env: env[key],
						global: self.global
					}
					tfilename = tmpl.render(orifilename, localenv);
					newPartConfig = libObject.copy1(partConfig);
					if(partConfig.name)
						newPartConfig.name = tmpl.render(partConfig.name, localenv);
					else
						newPartConfig.name = key;
					newPartConfig.env = libObject.copy1(env[key]);
					newPartConfig.env.argv = key;
					self.genFile(newPartConfig, tfilename, config);
				}
			}
		}
	}else{
		self.genFile(partConfig, orifilename, config);
	}

}
Disp.prototype.addStr = function(c, lang, deps){
	var self = this;
	var tmpstr = self.eval(c, lang, deps);
	return tmpstr || "";
}
Disp.prototype.genFile = function(partConfig, filename, config){
	var self = this;
	log.v("genFile "+filename);
	log.v(config);
	if(!partConfig.lang)
		partConfig.lang = "base";
	if(config.isPseudo == 1){
		if(partConfig.name){
			if(libObject.isArray(partConfig.name)){
				for(var i in partConfig.name){
					self.fileMap[partConfig.name[i]] = self.targetDir + "/" + filename;
				}
			}else{
				self.fileMap[partConfig.name] = self.targetDir + "/" + filename;
			}
		}
		return;
	}
	if(partConfig.arch){
		var dispConfig = {
			projectDir: self.projectDir + "/" + filename,
			targetDir: self.targetDir + "/" +filename,
			global: partConfig
		}
		if(partConfig.ignoreDispJson)
			dispConfig.ignoreDispJson = 1;
		if(partConfig.impl)
			dispConfig.global.impl = partConfig.impl;
		dispConfig.global.dev = self.global.dev;
		var tmpenv = self.getEnv(partConfig);
		for(var key in partConfig.global){
			var oldkey = partConfig.global[key];
			if(typeof oldkey == "string"){
				dispConfig.global[key] = libObject.getByKey(self.global, oldkey);
			}else{
				dispConfig.global[key] = self.global[key];
			}
		}
		if(tmpenv && !tmpenv._isGlobal)
			utils.extend(dispConfig.global, tmpenv);
		dispConfig.global.baseDir = self.projectDir;
		dispConfig.global.targetBaseDir = self.targetDir;
		var newDisp = new Disp(dispConfig, self.callback);
		newDisp.run();
	}
	if(partConfig.sub){
		self.genProjSub(partConfig.sub, {
			src: config.src,
			target: filename,
			isPseudo: config.isPseudo
		});
	}
	if(partConfig.sub || partConfig.arch){
		return;
	}
	log.i(filename);
	/*todo sync*/
	/**/
	var env = self.getEnv(partConfig);
	var lang = partConfig.lang;
  var str = "";
	var deps = {};
	self.eval({init: 1}, lang, deps);

	if(partConfig.code){
		str += self.eval(partConfig.code, lang, deps);
	}
	if(partConfig.hasOwnProperty("content")){
		var c = partConfig.content;
		if(c){
			if(libObject.isArray(c)){
				for(var i in c){
					str += self.eval(env[c[i]], lang, deps);
				}
			}else{
				str += self.eval(env[c], lang, deps);
			}
		}else{
			str += self.eval(env, lang, deps);
		}
	}
	if(partConfig.export){
		var c = partConfig.export;
		if(libObject.isArray(c)){
			for(var i in c){
				str += self.eval({Lexport: self.global[c[i]]}, lang, deps);
			}
		}else{
			str += self.eval({Lexport: self.global[c]}, lang, deps);
		}
	}


	if(!env._isGlobal){
		env.main = str;
	}
	env.global = self.global;
	if(partConfig.raw){
		str += tmpl.render(partConfig.raw, env);
	}

	if(partConfig.tmpl || partConfig.src){
		var evalFunc = function(json2, lang2, pseudoFlag){
			if(lang2) return self.eval(json2, lang2, deps, pseudoFlag);
			return self.eval(json2, lang, deps, pseudoFlag);
		}
		env.extend = {eval: evalFunc};
		var srcfile;
		if(partConfig.tmpl)
			srcfile = config.src + "/" + partConfig.tmpl;
		else if(partConfig.src)
			srcfile = self.projectDir + "/" + partConfig.src;
		env.deps = deps;
		str = tmpl.render({
			file: srcfile
		}, env);
		delete env.deps;
	}
/*
	parse deps 
*/

	var gdeps = {};
	self.expandDeps(deps, gdeps, partConfig);
	var parseDeps = [];
	var fileArgv = {};
	for(var key in gdeps){
		if(gdeps[key].isArgv){
			fileArgv[key] = gdeps[key];
		}else if(gdeps[key].files){
			for(var i in gdeps[key].files){
				var tmp = gdeps[key].files[i];
				if(gdeps[key].vendor) tmp.vendor = 1;
				tmp.name = key;
				parseDeps.push(tmp);
			}
		}else{
			parseDeps.push(gdeps[key]);
		}
	}
	var tfilename = self.targetDir + "/" + filename;

	str = self.eval({
		file: fileArgv,
		deps: parseDeps,
		main: str,
		fullpath: tfilename,
		lib: partConfig.lib,
		addExport: function(key, lib, reqconfig){
			self.addExport(key, lib, reqconfig);
		}
	}, lang, {});
	if(config.isPseudo){
		return;
	}
  libFile.mkdirpSync(path.dirname(tfilename)); //to be acc
  if(fs.existsSync(tfilename))
    fs.unlinkSync(tfilename);
	self.fileCount ++;
	var mode;
	if(partConfig.exec){
		mode = 0555;
		str = "#!/usr/bin/env "+ partConfig.exec + "\n" + str;
	}else{
		mode = 0444;
	}
  fs.writeFileSync(tfilename, str, {mode: mode});
	self.eval({finish: 1}, lang, gdeps);
}

Disp.prototype.genPlugin = function(){
	var self = this;
	//file struct
	for(var plugin in self.global.plugins){
		var configFile = self.global.pluginDir + "/" + plugin;
		var tmp;
		try {
			tmp = require(configFile);
		}catch(e){
			self.callback(e);
		}
		self.genProj(tmp, {
			src: configFile,
			target: self.target || ""
		});
	}
}
Disp.prototype.dispose = function(){
	var self = this;
	if(self.global._isRoot)
		fs.writeFileSync(
			self.projectDir + "/global.json", 
			JSON.stringify(self.global, function(key, value){
				if(key == "local" 
					 || key == "global" 
					 || key == "origin" 
					 || key[0] == "_")
					return undefined;
				else
					return value;
			}, 2)
		);
	log.i(self.fileCount + " files updated");
	log.v("dispose success");
}
Disp.prototype.getEnv = function(partConfig){
	var self = this;
	var env;
	if(partConfig.env){
		env = partConfig.env;
	}else if(partConfig.envkey){
		env = libObject.getByKey(self.global, partConfig.envkey);
		partConfig.env = env;
	}else
		env = self.global;
	if(!env) env = {};
	return env;
}


// simple methods
Disp.prototype.expandDeps = function(deps, gdeps, partConfig){
	var self = this;
	var lang = partConfig.lang;
	var vendors = self.eval({"vendor.json": 1}, lang);
	for(var key in deps){
		var vendorConfig = vendors[key];
		if(vendorConfig && vendorConfig.deps){
			self.expandDeps(vendorConfig.deps, gdeps, partConfig);
		}
		var langConfig = self.getDepConfig(key, lang, deps[key]);
		if(!partConfig.lib && langConfig && langConfig.deps){
			self.expandDeps(langConfig.deps, gdeps, partConfig);
		}
		if(!gdeps[key]){
			gdeps[key] = {};
		}
		if(vendorConfig){
			if(!gdeps[key].vendor){
				utils.extend(gdeps[key], vendorConfig);
			}
			gdeps[key].vendor = 1;
		}
		if(langConfig){
			utils.extend(gdeps[key], langConfig);
		}
		if(typeof deps[key] !="object")
			gdeps[key].val = deps[key];
		else
			utils.extend(gdeps[key], deps[key]);
	}
}
Disp.prototype.addExport = function(key, lib, reqconfig){
	var self = this;
	if(typeof lib == "string"){
		var name = lib;
		reqconfig.file = self.fileMap[name];
		reqconfig.sub = key;
		var toextend = {};
		toextend[name] = {};
		toextend[name][key]= {lib: key};
		utils.extend(self.global, toextend);
	}
}

var cache = {};
Disp.prototype.getDepConfig = function(key, lang, val){
	var self = this;
	var rtn = {};
//local file
	if(self.fileMap[key]){
		rtn.file = self.fileMap[key];
	}else{
//local lib			
		var evaljson = {};
		evaljson[key+".lib"] =1;
		var deps = {};
		if(self.eval(evaljson, lang, deps, true)){
			rtn.lib = key;
			rtn.deps = deps;
		}
//remote lib
		else {
			var toext = {
        _packages: {}
      }
			toext._packages[key] = val;
			libObject.extend(self.global, toext);
			rtn.pkg = key;
		}
	}
	rtn.name = key;

	return rtn;
}
Disp.prototype.getLangDir = function(lang){
	var self = this;
	if(lang.match(/^custom/)){
		return self.global.baseDir + "/words" + lang.replace("custom", "");
	}else{
		return self.global.langDir + "/" + lang;
	}
}
Disp.prototype.getLangConfig = function(lang){
	var self = this;
	var configFile = self.getLangDir(lang);
	if(cache[lang])
		return cache[lang];
	var config = {};
	try {
		config = require(configFile);
	}catch(e){
		config = {};
	}
	cache[lang] = config;
	return config;
}

Disp.prototype.getLangFile = function(name, lang, ignoreOnce){
	var self = this;
	var langConfig = self.getLangConfig(lang);
	var file = self.getLangDir(lang) + "/" + name;
	var resultFile;
	if(fs.existsSync(file)){
		if(!ignoreOnce)
			return file;
		ignoreOnce = 0;
	}
	for(var key in langConfig.deps){
		var tmpfile = self.getLangFile(name, key, ignoreOnce);
		if(tmpfile)
			return tmpfile;
	}
}

Disp.prototype.eval = function(json, lang, deps, pseudoFlag){
	var self = this;
	if(json === undefined || json === null || json === "") return "";
	var type = typeof json;
	var str = "";
	var searchlang;
	var ignoreOnce = 0;
	if(lang.match(/@/)){
		var tmparr = lang.split("@");
		lang = tmparr[0];
		searchlang = tmparr[1];
	}
	if(lang.match(/\!/)){
		lang = lang.substr(1);
		ignoreOnce = 1;
	}
	if(!searchlang) searchlang = lang;
	if(type !== "object"){
		return json; // return raw if not expr
	}else{
		if(libObject.isArray(json)){
			var toextend = {};
			for(var i in json){
				if(!i.match(/\d+/)){
					toextend[i] = json[i];
					delete json[i];
				}
			}
			for(var i in json){
				if(!json[i]) continue;
				json[i].index = i;
				utils.extend(json[i], toextend);
				str += self.eval(json[i], lang, deps) + "\n";
			}
			return str;
		}
	}
	var name = Object.keys(json)[0];
	if(!name) return "";
	if(name[0] == "L"){
		var toextendl = {};
		for(var key in json){
			if(key !== name)
				toextendl[key] = json[key];
		}
		for(var key in json[name]){
			var truename = name.substr(1);
			var tmpjson = {};
			tmpjson[truename] = json[name][key];
			tmpjson.name = key;
			utils.extend(tmpjson, toextendl);
			str += self.eval(tmpjson, lang, deps) + "\n";
		}
		return str;
	}

	log.v(json);
	var flags = {};
	var ms;
	if((ms = name.match(/\.(\S+)$/))){
		flags[ms[1]] = 1;
	}
//get config

	var file = self.getLangFile(name, searchlang, ignoreOnce);
	if(!file){
		if(pseudoFlag){
			if(pseudoFlag == 2){
				return {
					valid: ""
				};
			}else{
				return "";
			}
		}else{
			return self.callback(lang + " " + name + " not exist\n" + JSON.stringify(json));
		}
	}
//begin eval
//	tmpl.extendMethods("eval", 
	var evalFunc = function(json2, lang2, pseudoFlag){
		if(json.deps && typeof json2 == "object") json2.deps = json.deps;
		if(lang2) return self.eval(json2, lang2, deps, pseudoFlag);
		return self.eval(json2, lang, deps, pseudoFlag);
	}
	var data = {
		name: name,
		argv: json[name],
		deps: deps,
		lang: lang,
		parent: json,
		global: self.global,
		sup: function(){
			evalFunc(json, "!" + lang);
		},
		extend: {
			"eval": evalFunc
		}
	}
	
	var rtnstr = tmpl.render({file: file}, data);
/*
	if(flags.lib && rtnstr && rtnstr[0] == "~"){
		try{
			var func;
			eval('func = {"function":{'+rtnstr.substr(1)+'}}');
			if(json.name) func.name = json.name;
			rtnstr = self.eval(func, lang, deps);
		}catch(e){
			log.e('func = {"function":{'+rtnstr.substr(1)+'}}');
		}
	}else
*/ 
	if(flags.json){
		try{
			rtnstr = JSON.parse(rtnstr);
		}catch(e){
			JSON.parse(rtnstr);
			return self.callback("wrong json!");
		}
	}

	if(!pseudoFlag){
		return rtnstr;
	}else if(pseudoFlag == 2){
		return {
			"valid": 1,
			"content": rtnstr
		}
	}else{
		return 1;
	}
	
}
