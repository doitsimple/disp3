var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var utils =require("./utils");
var tmpl = require("./tmpl");
var checkName = require("./utils").checkName;
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
	var projectJson;
	if(fs.existsSync(self.projectDir + "/project.json")){
		projectJson = libFile.readJSON(self.projectDir + "/project.json");
		self.global.project = projectJson;
	}else if(fs.existsSync(self.projectDir + "/disp.json")){
		self.global = libFile.readJSON(self.projectDir + "/disp.json");
		projectJson = self.global.project;
	}else{
		return self.error("no disp.json");
	}
	

	self.project = projectJson;
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
		log.v("label: " + label);
		if(!self.global[label]){
			if(fs.existsSync(self.projectDir + "/" + label + ".json")) 
				self.global[label] = libFile.readJSON(self.projectDir + "/" + label + ".json");
			else
				self.global[label] = {};
		}
	}
	mountJSON(self.global);
	mountString(self.global);
	self.global.tmpls = self.tmpls;
	self.global.froms = self.froms;
	self.global.formats = self.formats;

//format global
//	for(var label in self.formats){		
	if(format.call(self, "global", self, self.formats)) return 1;	
//	}

//read previous file list
	if(fs.existsSync(self.projectDir + "/disp.filelist.json"))
		self.prevFilelist = libFile.readJSON(self.projectDir + "/disp.filelist.json");

//extend global if task is not main
  if(self.task != "main")
    utils.extend(self.global, libFile.readJSON(self.task + ".json"));

//format target path
  projectJson.target = path.relative(".", projectJson.target);
  if(projectJson.target == "") projectJson.target = ".";


//add internal fsconfigs
	//if target is not "." add target ignore to fsconfigs
	for(var label in self.formats){
		//set XXX.json tobe not generated
		libObject.setIfEmpty(projectJson.fsconfigs, label + ".json", 
												 {ignore: true}); 		
	}
  if(self.task != "main")
		libObject.setIfEmpty(projectJson.fsconfigs, self.task + ".json", 
												 {ignore: true});

	if(projectJson.target != "."){
		var target = path.relative(".", projectJson.target);
		libObject.setIfEmpty(projectJson.fsconfigs, target, {ignore: true});
	}

	self.fsconfigs = projectJson.fsconfigs || {};
	return 0;
}
function extendConfigs(){
	var self = this;
	log.i(self.navpaths);
//extend global again (because walk may overwrite global)
  if(self.task != "main")
    utils.extend(self.global, libFile.readJSON(self.task + ".json"));
//format twice
	if(format.call(self, "global", self, self.formats)) return 1;
	mountJSON(self.global);
	mountString(self.global);
	if(!fs.existsSync(self.global.project.target))
		libFile.mkdirpSync(self.global.project.target);
	fs.writeFileSync(self.global.project.target + "/disp.global.json", libObject.stringify(self.global, undefined, 2));
	return 0;
}
function readConfigsSub(arch){
	var self = this;
	var archDir = self.rootDir + "/arch/" + arch;	
	var projectJson = self.global.project;

/*add format.json*/
	var formatJson;
	if(fs.existsSync(archDir + "/format.json")){
		formatJson = libFile.readJSON(archDir + "/format.json");
	}else{
		formatJson = {};
	}
	libObject.append(self.formats, formatJson);
/*---*/

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

	if(fs.existsSync(archDir + "/lib")){
		var arr = libFile.readdirNotDirSync(archDir + "/lib");
		for(var i in arr){
			var fname = arr[i];
			if(!checkName(fname)) continue;
			var ms = fname.replace(/\./g, "");
			self.libs[ms] = archDir + "/lib/" + fname;
		}
	}

	if(archJson.deps){
		for(var dep in archJson.deps){
			readConfigsSub.call(self, dep);
		}
	}
}
function checkConfig(arch, label){
	var self = this;
	var archDir = self.rootDir + "/arch/" + arch;	
	var formatProjectJson = libFile.readJSON(archDir+ "/format/" + label +".json");
	if(formatProjectJson){
		if(!self.formats[label]) self.formats[label] = formatProjectJson;
		else libObject.append(self.formats[label], formatProjectJson);
	}
}
function getLabels(arch){
	var self = this;
// find how many json to format for the arch
	var archDir = self.rootDir + "/arch/" + arch;	
	var ms;
	var labels = {};
	if(!fs.existsSync(archDir + "/format")) return labels;
	var files = fs.readdirSync(archDir + "/format");
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
function format(key1, parent, formatJson){
	var self = this;
	if(typeof formatJson != "object"){
		formatJson = {
			$type: typeof formatJson,
			$default: formatJson
		}
	}
	if(typeof parent != "object")
		return self.error(parent + " is not object");
	// assume both json and formatJson are ensured not null
	if(formatJson.$required && !parent.hasOwnProperty(key1)) 
		return self.error(key1 + " required" + "\n" + JSON.stringify(formatJson));
	if(!parent.hasOwnProperty(key1)){
		if(formatJson.$multi)
			parent[key1] = [];
		else if(!formatJson.$type)
			parent[key1] = {};		
	}
	if(formatJson.$type){
// leaf
		var f = formatJson;
		if(f.$default){
			if(!parent.hasOwnProperty(key1)) parent[key1] = f.$default;
		}
		if(f.$multi){
			if(f.$default) if(!parent[key1].length) parent[key1] = f.$default;
			if(!libObject.isArray(parent[key1])) return self.error("not array " +  key1 + ":" + parent[key1]);
			var vals = parent[key1];
			for(var i=0; i<vals.length; i++){
				if(formatSub.call(self, key1, vals[i], f)) return 1;
			}
		}else{
			if(f.$eq && !parent.hasOwnProperty(key1)) 
				parent[key1] = parent[f.$eq];
			if(formatSub.call(self, key1, parent[key1], f)) return 1;
		}
		return 0;
	}	

	if(formatJson.$list){
		if(formatJson.$multi) return self.error("$multi and $list should not used together");
		if(formatJson.$default){
			for(var key2 in formatJson.$default){
				if(!parent[key1][key2]) parent[key1][key2] = formatJson.$default[key2];
			}
		}
		for(var key2 in parent[key1]){
			if(key2[0] == "$" || key2 == "name") continue;
			if(format.call(self, key2, parent[key1], formatJson.$list))	return 1;
		}
		return 0;
	}
	parent[key1].name = key1;
	for(var key2 in formatJson){
		if(key2[0] == "$" || key2 == "name") continue;
		var f = formatJson[key2];
		if(format.call(self, key2, parent[key1], f)) return 1;
	}

	return 0;
}
function formatSub(key, val, f){
	var self = this;
	if(val == undefined && !f.$required) return 0;
	switch(f.$type){
	case "number":
		//number
		if(typeof val != "number") return self.error("wrong number format " + key + ":" + val);
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
		if(typeof val != "string") return self.error("wrong string format " + key + ":" + val + "\n"+JSON.stringify(f));
		if(f.$regex && !val.match(f.$regex)) return self.error(key + ":" + val + " not match " + f.$regex);
		if(f.$from){
			var ljson = libObject.getByKey(self.global, f.$from);
			if(!(val in ljson)) return self.error(val + " is not in " + Object.keys(ljson));
			if(!self.froms[key])
				self.froms[key] = f.$from;
			else if(self.froms[key] != f.$from)
				return self.error(key + " is bind to " +self.froms[key], 
													", so "+f.$from + " is not allowed");
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
