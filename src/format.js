var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var utils =require("./utils");
var tmpl = require("./tmpl");
var checkName = require("./utils").checkName;
var log = require("../lib/nodejs/log");
module.exports = {
	format: format
}
function format(key1, parent, formatJson){
	var self = this;
	if(typeof formatJson != "object"){
		formatJson = {
			$type: typeof formatJson,
			$default: formatJson
		}
	}
	if(typeof parent != "object"){
		return self.error(parent + " is not object");
	}
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

