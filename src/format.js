var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");

var root = path.resolve(__dirname + "/..");
var archRoot = path.resolve(root + "/arch");

var labels = ["project", "proto", "impl"];
module.exports.readAndCheckConfig = readAndCheckConfig;
function readAndCheckConfig(dir){
	var configCache = readConfig(dir);
	if(!configCache){
		console.error("no config files in " + dir);
		return null;
	}
	var arch = configCache.project.arch;
	if(!arch) {
		console.error("no architechture");
		return null;
	}
	console.log("architechure " + arch);
	var formatCache = readConfig(archRoot + "/" + arch);
	for(var i=0; i<labels.length; i++){
		var label = labels[i];
		if(!checkKit(configCache[label], formatCache[label])){
			console.error(label + ".json in wrong format");
			return null;
		}
	}
	return {
		config: configCache,
		format: formatCache
	};
}
function readConfig(dir){
	var cache = {};
	for(var i=0; i<labels.length; i++){
		var label = labels[i];
		var file = dir + "/" + label + ".json";
		var json = libFile.readJSON(file);
		if(!json){
			return null;
		}
		cache[label] = libFile.readJSON(file);

	}
	return cache;
}
module.exports.checkKit = checkKit;
function checkKit(json, fjson){
	if(!fjson.kit){
		console.error("no key 'kit' in "+JSON.stringify(fjson, undefined, 2));
		return 0;
	}
	switch (fjson.kit){
		case "list":
			for(var name in json){
				if(!checkFormat(json[name], fjson.format)){
					console.error(name +  " wrong format");
					return 0;
				}
			}
			break;
		case "mono":
		default:
			if(!checkFormat(json, fjson.format)){
				return 0;
			}
	}
	return 1;
}
module.exports.checkFormat = checkFormat;
function checkFormat(json, fjson){

	for(var key in fjson){
		var entryFormat = fjson[key];
		if(typeof entryFormat == "string")
			entryFormat = {type: entryFormat};
		if(!json.hasOwnProperty(key)){
			if(entryFormat.default)
				json[key] = entryFormat.default;
			else if(entryFormat.required){
				console.error(key + " required but not existed");
				return 0;
			}else{
				continue;
			}
		}else{
			if(entryFormat.kit){
				if(!checkKit(json[key], entryFormat)){
					console.error(key + " is not the format of kit " + entryFormat.kit);
					return 0;
				}else{
					continue;
				}
			}
		}
		switch(entryFormat.type){
			case "enum":
				if(entryFormat.sets){
					if(libArray.indexOf(entryFormat.sets, json[key]) == -1){
						console.error(json);
						console.error(key + " is not in " + entryFormat.sets.join(", "));
						return 0;					
					}
				}else if(entryFormat.from){
					//TODO
				}
				break;
			case "number":
				if(typeof json[key] != "number"){
					console.error(JSON.stringify(json, undefined, 2) +key + " is not number");
					return 0;
				}
				break;
			case "string":
			default:
				if(typeof json[key] != "string"){
					console.error(JSON.stringify(json, undefined, 2) +key + " is not string");
					return 0;
				}
		}
	}
	return 1;
}

