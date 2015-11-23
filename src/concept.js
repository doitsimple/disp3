module.exports = {
	invoke: invoke,
	define: define,
	setEnv: setEnv
}
var fs = require("fs");
var tmpl = require("./tmpl");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var utils = require("./utils");
var namecache = {};
var cache = {};
var env;
function setEnv(_env){
	env = _env;
	var list = libFile.readdirNotDirSync(env.rootDir + "/words");
	for(var i in list){
		if(!utils.checkName(list[i])) continue;
		var m = list[i].match(/^(\S+)\.([^\.]+)$/);
		if(!m) continue;
		if(!namecache[m[1]])
			namecache[m[1]] = {};
		namecache[m[1]][m[2]] = 1;
	}
	tmpl.extendMethods("define", define);
	tmpl.extendMethods("invoke", invoke);
}
function get(name){
	var self = this;
	if(cache[name])
		return cache[name];
	if(namecache[name]){
		var tmp = namecache[name];
		var seq = env.project.seq;
		for(var i in seq){
			if(tmp[seq[i]])
				return tmpl.render({
					file:env.rootDir+"/words/"+name+"."+seq[i], 
					pre: "^^$.define('"+name+"', function(p, params){$$",
					post: "^^})$$"
				}, {
					global:env
				});
		}
	}
	log.e(name+": file not exists");
}
function define(name, fn){
	if(!cache[name])
		cache[name] = fn;
	else
		log.e(name + " already defined");
}
function invoke(name, p, params){
	var self = this;
	if(!cache[name]) get(name);
	if(!cache[name]) return log.e(name + ": load failed");
	cache[name](p, params);
}
