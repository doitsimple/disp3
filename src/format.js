var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
module.exports = {
	readConfigs: readConfigs,
	extendConfigs: extendConfigs,
	format: format
}
function readConfigs(){
	var self = this;
// begin with project.json
	log.v("read project.json");
	if(!fs.existsSync(self.projectDir + "/project.json")) return self.error("no prject.json");
	var projectJson = libFile.readJSON(self.projectDir + "/project.json");
	self.global.project = projectJson;

	if(!projectJson.arch) projectJson.arch = "base";
	var archDir = self.rootDir + "/arch/" + projectJson.arch;
	if(!fs.existsSync(archDir))
		return self.error("no archDir: " + archDir);
	log.v("arch: " + projectJson.arch);

//iterate deps and read formats
	if(readConfigsSub.call(self, projectJson.arch)) return 1;
	//base arch is load by default
	if(!self.formats["base"])
		if(readConfigsSub.call(self, "base")) return 1;

// read global
	for(var label in self.formats){
		if(!self.global[label]){
			if(fs.existsSync(self.projectDir + "/" + label + ".json")) 
				self.global[label] = libFile.readJSON(self.projectDir + "/" + label + ".json");
			else
				self.global[label] = {};
		}
	}
	mountJSON(self.global);
	mountString(self.global);

//format global
	for(var label in self.formats){
		log.v("format " + label + ".json");
		if(format.call(self, label, self.global, self.formats[label])) return 1;	
	}

//read previous file list
	if(fs.existsSync(self.projectDir + "/disp.filelist.json"))
		self.prevFilelist = libFile.readJSON(self.projectDir + "/disp.filelist.json");

//extend global if task is not main
  if(self.task != "main")
    libObject.extend(self.global, libFile.readJSON(self.task + ".json"));

//format target path
  self.global.project.target = path.relative(".", self.global.project.target);
  if(self.global.project.target == "") self.global.project.target = ".";


//add internal fsconfigs
	//if target is not "." add target ignore to fsconfigs
	for(var label in self.formats){
		//set XXX.json tobe not generated
		libObject.setIfEmpty(projectJson.fsconfigs, label + ".json", 
												 {ignore: true}); 		
	}

	if(self.global.project.target != "."){
		var target = path.resolve(self.global.project.target);
		libObject.setIfEmpty(self.global.project.fsconfigs, target, {ignore: true});
	}

	self.fsconfigs = self.global.project.fsconfigs || {};
	console.log("global!!!!");
	console.log(self.global);
	console.log("formats!!!!");
	console.log(self.formats);
	console.log("archs!!!!");
	console.log(self.archs);
	return 0;
}
function extendConfigs(){
	var self = this;

//extend global again (because walk may overwrite global)
  if(self.task != "main")
    libObject.extend(self.global, libFile.readJSON(self.task + ".json"));

	return 0;
}
function readConfigsSub(arch){
	var self = this;
	var archDir = self.rootDir + "/arch/" + arch;	
	var projectJson = self.global.project;
	// check deps and check format

	var labels = getLabels.call(self, arch);
	for(var label in labels){
		checkConfig.call(self, arch, label);
	}
	var archJson;
	if(fs.existsSync(archDir + "/arch.json")){
		archJson = libFile.readJSON(archDir + "/arch.json");
	}else{
		archJson = {};
	}
	self.archs[arch] = archJson;
	if(archJson.deps){
		for(var dep in archJson.deps){
			readConfigsSub.call(self, dep);
		}
	}
}
function checkConfig(arch, label){
	var self = this;
	var archDir = self.rootDir + "/arch/" + arch;	
	log.v("read " + arch + " format: " + label + ".json");
	var formatProjectJson = libFile.readJSON(archDir+ "/format/" + label +".json");

	if(formatProjectJson){
		if(!self.formats[label]) self.formats[label] = formatProjectJson;
		else libObject.append(self.formats[label], formatProjectJson);
//		log.v("format " + label + ".json");
//		if(format.call(self, self.global[label], formatProjectJson)) return 1;
	}
}
function getLabels(arch){
	var self = this;
// find how many json to format for the arch
	var archDir = self.rootDir + "/arch/" + arch;	
	var files = fs.readdirSync(archDir + "/format");
	var ms;
	var labels = {};
	for(var i=0; i<files.length; i++){
		var file = files[i];
		if((ms = file.match(/(\S+)\.json$/))){
			var label = ms[1];
			labels[label] = 1;
		}
	}
	return labels;
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
      var jpath = path.resolve(dir + "/" +e.substr(2));
      var json = libFile.readJSON(jpath);
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
		if(typeof e != "string") return;
		e = e.replace(/#([^#]+)#/g, function(match, p1) {
			if(!p1.match(/\(/)){
				return libObject.getByKey(config, p1);
			}else{
				return eval(p1);
			}
		});
    if(i==undefined)
      itConfig[key] = e;
    else
      itConfig[key][i] = e;
  });
}
function format(key, parent, formatJson){
	var self = this;
	if(typeof formatJson != "object"){
		formatJson = {
			$type: typeof formatJson,
			$default: formatJson
		}
	}

	// assume both json and formatJson are ensured not null
	if(formatJson.$required && !parent.hasOwnProperty(key)) 
		return self.error(key + " required");
	if(!parent[key]){
		if(formatJson.$multi)
			parent[key] = [];
		else if(!formatJson.$type)
			parent[key] = {};		
	}

	if(formatJson.$type){
// leaf
		var f = formatJson;
		if(f.$default)
			if(!parent[key]) parent[key] = f.$default;
		if(f.$multi){
			if(f.$default) if(!parent[key].length) parent[key] = f.$default;
			if(!libObject.isArray(parent[key])) return self.error("not array " +  key + ":" + parent[key]);
			var vals = parent[key];
			for(var i=0; i<vals.length; i++){
				if(formatSub.call(self, key, vals[i], f)) return 1;
			}
		}else{
			if(formatSub.call(self, key, parent[key], f)) return 1;
		}
	}
	if(formatJson.$list){
		if(formatJson.$multi) return self.error("$multi and $list should not used together");
		if(formatJson.$default){
			for(var key2 in formatJson.$default){
				if(!parent[key][key2]) parent[key][key2] = formatJson.$default[key2];
			}
		}
		for(var key2 in parent[key]){
			if(format.call(self, key2, parent[key], formatJson.$list))	return 1;
		}
		return 0;
	}
	for(var key2 in formatJson){
		if(key2[0] == "$") continue;
		var f = formatJson[key2];
		if(format.call(self, key2, parent[key], f)) return 1;
	}

	return 0;
}
function formatSub(key, val, f){
	var self = this;
	switch(f.$type){
	case "number":
		//number
		if(typeof val != type) return self.error("wrong " + type +" format " + key + ":" + val);
		if(f.$gt && val <= f.$gt) return self.error(key + ":" + val + " not gt " + f.$gt);
		if(f.$gte && val < f.$gte) return self.error(key + ":" + val + " not gte " + f.$gte);
		if(f.$lt && val >= f.$lt) return self.error(key + ":" + val + " not lt " + f.$lt);
		if(f.$lte && val > f.$lte) return self.error(key + ":" + val + " not lte " + f.$lte);
		break;
	case "boolean":
		//boolean check nothing
		break;
	case "string": 
		//string
		if(typeof val != "string") return self.error("wrong string format " + key + ":" + val);
		if(f.$regex && !val.match(f.$regex)) return self.error(key + ":" + val + " not match " + f.$regex);
		if(f.$from){
			var ljson = libObject.getByKey(self.global, f.$from);
			if(!(val in ljson)) return self.error(val + " is not in " + Object.keys(ljson));	
		}
		break;
	default:
		//object
		return self.error("unexpected enter formatSub");
		break;
	}
	return 0;
}

/*
function foreach(obj, fn, fndone){
	if(!obj) return;
	if(libObject.isArray(obj)){
		if(obj.length < 1) return;
		foreach_arr_cb(0, obj, fn, fndone);
	}else{
		var keys = Object.keys(obj);
		if(keys.length < 1) return;
		foreach_hash_cb(0, keys, obj, fn, fndone);
	}
}
function foreach_arr_cb(key, obj, fn, fndone){
	if(typeof obj[key] == "string") obj[key] = {name: obj[key]};
	fn(obj[key], function(err){
		if(key+1 >= obj.length || err) return fndone(err);
		foreach_arr_cb(key+1, obj, fn, fndone);
	});
}
function foreach_hash_cb(i, keys, obj, fn, fndone){
	var key = keys[i];
	if(typeof obj[key] == "string") obj[key] = {name: obj[key]};
	fn(obj[key], function(err){
		if(i+1 >= keys.length || err) return fndone(err);
		foreach_hash_cb(i+1, keys, obj, fn, fndone);
	});
}
*/
