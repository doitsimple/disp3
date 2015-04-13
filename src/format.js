var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");

module.exports.readAndCheckConfig = readAndCheckConfig;
function readAndCheckConfig(dir, rootDir){
	var archRoot = path.resolve(rootDir + "/arch");

	var configCache = readConfig(dir, "project");
	log.i("read project.json");
	if(!configCache){
		log.e("no config files in " + dir);
		return null;
	}
	var archs = ["base"];
	if(configCache.project && configCache.project.arch) {
		archs.push(configCache.project.arch);
	}
	log.i("!architecture " + archs);

	
	var formats = {};
	for(var i=0; i<archs.length; i++){
		var arch = archs[i];
		var formatCache = readConfig(archRoot + "/" + arch + "/format");
		for(var label in formatCache){
			if(label != "project" && !configCache[label]){
				log.i("read " + label + ".json");
				var cache = readConfig(dir, label);
				configCache[label] = cache[label];
			}
		}

		for(var label in formatCache){			
			if(!checkKit(configCache[label], formatCache[label], configCache)){
				log.e(label + ".json in wrong format");
				return null;
			}
			libObject.setIfEmpty(configCache.project.fsconfigs, 
													 path.resolve(label + ".json"), {ignore: true}); 
		}
		formats.arch = formatCache;
	}

	libObject.setIfEmpty(configCache.project.fsconfigs, 
											 path.resolve("project.json"), {ignore: true});
	if(configCache.project.target != "."){
		var target = path.resolve(configCache.project.target);
		libObject.setIfEmpty(configCache.project.fsconfigs, target, {ignore: true});
	}
	return {
		config: configCache,
		formats: formats
	};
}
function readConfig(dir, labels){
	if(typeof labels == "string"){
		var tmp = {}; tmp[labels] = true; labels = tmp;
	}
	var cache = {};
	var files = fs.readdirSync(dir);
	var ms;
	for(var i=0; i<files.length; i++){
		var file = files[i];
		if((ms = file.match(/(\S+)\.json$/))){
			var label = ms[1];
			if(labels && !labels[label]) continue;
			var json = libFile.readJSON(dir + "/" +file);
			if(!json){
				return null;
			}
			cache[label] = json;
		}
	}
	return cache;
}
module.exports.checkKit = checkKit;
function checkKit(json, fjson, env){
	if(!json){
		log.e("checkKit params error");
		return false;
	}
	if(!fjson.kit){
		log.e("no key 'kit' in "+JSON.stringify(fjson, undefined, 2));
		return false;
	}
	if(fjson.default){
		for(var name in fjson.default){
			if(!json[name])
				json[name] = fjson.default[name];
		}
	}

	switch (fjson.kit){
		case "list":
			for(var name in json){
				if(!checkFormat(json[name], fjson.format, env)){
					log.e(name +  " wrong format");
					return false;
				}
				json[name].name = name;
			}
			break;
		case "mono":
		default:
			if(!checkFormat(json, fjson.format, env)){
				return false;
			}
	}
	return true;
}
module.exports.checkFormat = checkFormat;
function checkFormat(json, fjson, env){
	if(!json) {
		log.e("checkFormat wrong params");
		return false;
	}
	for(var key in fjson){
		var entryFormat = fjson[key];
		if(typeof entryFormat == "string")
			entryFormat = {type: entryFormat};
		if(!json.hasOwnProperty(key)){
			if(entryFormat.default){
				json[key] = entryFormat.default;
			}else	if(entryFormat.required){
				log.e(key + " required but not existed");
				return false;
			}else if (entryFormat.type == "enums"){
				// default all enums
				//	processed in the switch 
				// done
			}else{
				continue;
			}
		}
		if(entryFormat.kit && json[key]){
			if(!checkKit(json[key], entryFormat, env)){
				log.e(key + " is not the format of kit " + entryFormat.kit);
				return false;
			}else{
				continue;
			}
		}
		
		if(!entryFormat.type){
			log.e(entryFormat);
			log.e(json[key]);
			log.e("Format json error");
			return false;
		}
		switch(entryFormat.type){
		case "enums":
			if(typeof json[key] == "string")
				json[key] = [json[key]];
			if(entryFormat.sets){
				if(json[key]){
					for(var i=0; i<json[key].length; i++){
						if(libArray.indexOf(entryFormat.sets, json[key][i]) == -1){
							log.e(key + ":" + json[key][i] + " is not in " + entryFormat.sets.join(", "));
							return false;			
						}
					}
				}else{
					json[key] = entryFormat.sets;
				}
			}else if(entryFormat.from){
				var list = libObject.getByKey(env, entryFormat.from);
				if(!list){
					log.e("no " + entryFormat.from + " in ");
					log.e(env);
					return false;
				}
				if(json[key]){
					for(var i=0; i<json[key].length; i++){
						if(!list[json[key]]){
							log.e(key + ":" + json[key][i] + " is not in " + Object.keys(list).join(", "));
							return false;
						}
					}
				}else{
					json[key] = Object.keys(list);
				}
			}
			break;
		case "enum":
			if(entryFormat.sets){
				if(libArray.indexOf(entryFormat.sets, json[key]) == -1){
					log.e(key + ":" + json[key] + " is not in " + entryFormat.sets.join(", "));
					return false;					
				}
			}else if(entryFormat.from){
				var list = libObject.getByKey(env, entryFormat.from);
				if(!list){
					log.e("no " + entryFormat.from + " in ");
					log.e(env);
					return false;
				}
				if(!list[json[key]]){
					log.e(key + ":" + json[key] + " is not in " + Object.keys(list).join(", "));
					return false;
				}
			}
			break;
		case "number":
			if(typeof json[key] != "number"){
				log.e(JSON.stringify(json, undefined, 2) +key + " is not number");
				return false;
			}
			break;
		case "string":
		default:
			if(typeof json[key] != "string"){
				log.e(JSON.stringify(json, undefined, 2) + key + " is not string");
				return false;
			}
		}
	}
	return true;
}

