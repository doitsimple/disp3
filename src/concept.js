module.exports = {
	invoke: invoke,
	define: define,
	eval: _eval,
	initConcept: initConcept,
	parseArgs: parseArgs
}
var libObject = require("../lib/js/object");
var libArray = require("../lib/js/array");
var fs = require("fs");
var tmpl = require("./tmpl");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var utils = require("./utils");
var cache = {};
var vcache = {};
var ncache = {};
var acache = {};
var words = {};
var env;
var langs;
var types;
function readCache(dir, _cache){
	var list;
	list = libFile.readdirNotDirSync(env.rootDir + dir);
	for(var i in list){
		if(!utils.checkName(list[i])) continue;
		var m = list[i].match(/^(\S+)\.([^\.]+)$/);
		if(!m) continue;
		if(!_cache[m[1]])
			_cache[m[1]] = {};
		if(m[2] == "json"){
			if(words[m[1]]) log.e("already exists "+list[i]);
			words[m[1]] = env.rootDir+dir+"/"+list[i];
		}else{
			if(_cache[m[1]][m[2]]) log.e("already exists " + list[i]);
			_cache[m[1]][m[2]] = 1;
		}
	}	
}
function initConcept(){
	var self = this;
	env = self.global;
	langs = self.langs;
	types = self.types;
	readCache("/dic/v", vcache);
	readCache("/dic/n", ncache);
	readCache("/dic/a", acache);
	env.vars = {};
	tmpl.extendMethods("define", define);
	tmpl.extendMethods("invoke", invoke);
	tmpl.extendMethods("require", _require);
	tmpl.extendMethods("eval", _eval);
	tmpl.extendMethods("parseArgs", parseArgs);
	tmpl.extendMethods("createInstances", createInstances);
	return 0;
}
function get(name, local){
	var self = this;
	if(typeof words[name] == "string")
		words[name] = libFile.readJson(words[name]);
	var type = local.type;
	if(!type) return {};
	if(!cache[type]) 
		cache[type] = {}; 
	if(cache[type][name])
		return {};
	var tmp;
	var seq = libArray.copy(types[type]);
	seq.unshift("disp");
// need optimaztion
	if(vcache[name]){
		tmp = vcache[name];
		for(var i in seq){
			if(tmp[seq[i]])
				return tmpl.render({
					file:env.rootDir+"/dic/v/"+name+"."+seq[i], 
					pre: "^^$.define('"+name+"', function(local, args){with(local){args = $.parseArgs(args, local);$$",
					post: "^^}}, local)$$"
				}, {
					global:env
				});
		}
	}
	if(ncache[name]){
		tmp = ncache[name];
		for(var i in seq){
			if(tmp[seq[i]])
				return tmpl.render({
					file:env.rootDir+"/dic/n/"+name+"."+seq[i], 
					pre: "^^$.define('"+name+"', function(local, args){with(local){$.createInstances(args, function(name, args){$$",
					post: "^^}, local)}}, local)$$"
				}, {
					global:env
				});
		}
	}
	if(acache[name]){
		tmp = acache[name];
		for(var i in seq){
			if(tmp[seq[i]])
				return tmpl.render({
					file:env.rootDir+"/dic/a/"+name+"."+seq[i], 
					pre: "^^$.define('"+name+"', function(local, args){with(local){$$",
					post: "^^}}, local)$$"
				}, {
					global:env
				});
		}
	}
	log.e(name+": file not exists");
}
function define(name, fn, local){
	var type = local.type;
	if(!cache[type]) cache[type] = {};
	if(!cache[type][name]){
		cache[type][name] = fn;
	}
	else
		log.e(name + " already defined");
}
function invoke(name, args, local){
	var type = local.type;
	var self = this;
	get(name, local);
	if(!cache[type][name]) return log.e(name + ": load failed");
	return cache[type][name](local, args);
}
function _eval(args, local){
	for(var key in args){
		if(key == "name") continue;
		return invoke(key, args[key], local);
	}
}
function _require(str, type, local){
	local.requires[str] = type || 1;
}
function parseArgs(args, local){
	if(libObject.isArray(args)){
		for(var i in args){
			if(typeof args[i] == "object")
				args[i] = _eval(args[i], local);
		}
	}else if(typeof args == "object"){
		args = _eval(args, local);
	}
	return args;
}
function createInstance(subargs, local){
	for(var key in subargs){
		if(key == "name") continue;
		subargs[key] = parseArgs(subargs[key], local);
	}
	return subargs;
}
function createInstances(args, fn, local){
	for(var key in args){
		if(key == "name") continue;
		args[key] = createInstance(args[key], local);
		env.vars[key] = args.name;
		fn(key, args[key]);
	}
}
