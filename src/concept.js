module.exports = {
	invoke: invoke,
	define: define,
	eval: _eval,
	setEnv: setEnv,
	parseParams: parseParams,
	genRequires: genRequires
}
var libObject = require("../lib/js/object");
var fs = require("fs");
var tmpl = require("./tmpl");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var utils = require("./utils");
var cache = {};
var vcache = {};
var ncache = {};
var acache = {};
var env;
function setEnv(_env){
	env = _env;
	var list;
	list = libFile.readdirNotDirSync(env.rootDir + "/dic/v");
	for(var i in list){
		if(!utils.checkName(list[i])) continue;
		var m = list[i].match(/^(\S+)\.([^\.]+)$/);
		if(!m) continue;
		if(!vcache[m[1]])
			vcache[m[1]] = {};
		vcache[m[1]][m[2]] = 1;
	}
	list = libFile.readdirNotDirSync(env.rootDir + "/dic/n");
	for(var i in list){
		if(!utils.checkName(list[i])) continue;
		var m = list[i].match(/^(\S+)\.([^\.]+)$/);
		if(!m) continue;
		if(!ncache[m[1]])
			ncache[m[1]] = {};
		ncache[m[1]][m[2]] = 1;
	}
	list = libFile.readdirNotDirSync(env.rootDir + "/dic/a");
	for(var i in list){
		if(!utils.checkName(list[i])) continue;
		var m = list[i].match(/^(\S+)\.([^\.]+)$/);
		if(!m) continue;
		if(!acache[m[1]])
			acache[m[1]] = {};
		acache[m[1]][m[2]] = 1;
	}
	env.vars = {};
	tmpl.extendMethods("define", define);
	tmpl.extendMethods("invoke", invoke);
	tmpl.extendMethods("require", _require);
	tmpl.extendMethods("eval", _eval);
	tmpl.extendMethods("parseParams", parseParams);
	tmpl.extendMethods("createInstances", createInstances);
}
function get(name){
	var self = this;
	if(cache[name])
		return cache[name];
	var tmp;
	var seq = env.project.seq;
	if(vcache[name]){
		tmp = vcache[name];
		for(var i in seq){
			if(tmp[seq[i]])
				return tmpl.render({
					file:env.rootDir+"/dic/v/"+name+"."+seq[i], 
					pre: "^^$.define('"+name+"', function(local, params){with(local){params = $.parseParams(params, local);$$",
					post: "^^}})$$"
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
					pre: "^^$.define('"+name+"', function(local, params){with(local){$.createInstances(params, function(name, params){$$",
					post: "^^}, local)}})$$"
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
					pre: "^^$.define('"+name+"', function(local, params){with(local){$$",
					post: "^^}})$$"
				}, {
					global:env
				});
		}
	}
	log.e(name+": file not exists");
}
function define(name, fn){
	if(!cache[name]){
		cache[name] = fn;
	}
	else
		log.e(name + " already defined");
}
function invoke(name, params, local){
	var self = this;
	if(!cache[name]) get(name);
	if(!cache[name]) return log.e(name + ": load failed");
	return cache[name](local, params);
}
function _eval(params, local){
	for(var key in params){
		if(key == "name") continue;
		return invoke(key, params[key], local);
	}
}
function _require(){
}
function genRequires(){
}
function parseParams(params, local){
	if(libObject.isArray(params)){
		for(var i in params){
			if(typeof params[i] == "object")
				params[i] = _eval(params[i], local);
		}
	}else if(typeof params == "object"){
		params = _eval(params, local);
	}
	return params;
}
function createInstances(params, fn, local){
	for(var key in params){
		if(key == "name") continue;
		params[key] = parseParams(params[key], local);
		env.vars[key] = params.name;
		fn(key, params[key]);
	}
}
