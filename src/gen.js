var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var concept = require("./concept");
var render = require("./tmpl").render;
var reservedKey = require("./tmpl").reservedKey;
module.exports = {
	genFiles: genFiles
}

function genFiles(){
	var self = this;
	var fileList = self.filelist;
	var globalEnv = self.global;

/* check fsconfigs */
	var fsconfigs = globalEnv.project.fsconfigs;
	var	target = globalEnv.project.target;

	target = target || ".";
	var fileListModified = fileList;
	if(!fs.existsSync(target))
		libFile.mkdirpSync(target);
	fs.writeFileSync(target + "/disp.global.json", libObject.stringify(self.global, undefined, 2));
	fs.writeFileSync(target + "/disp.filelist.json", JSON.stringify(self.filelist, undefined, 2));


/* generate file */
	for (var orifilename in fileListModified){
		var partConfig = fileListModified[orifilename];
		var filename = target + "/" + orifilename;
		libFile.mkdirpSync(path.dirname(filename)); // should have a more efficient way
/*todo sync*/
/**/

		if(partConfig.self){
			if(globalEnv.project.target != "."){
				libFile.copySync(orifilename, filename);
			}
			continue;
		}
		if(partConfig.selflink){
			if(globalEnv.project.target != "."){
				libFile.copylinkSync(orifilename, filename);
			}
			continue;
		}

		if(partConfig.src){
			if(partConfig.src != filename)
				libFile.copySync(partConfig.src, filename);
			continue;
		}

		if(partConfig.srclink){
			if(partConfig.srclink != filename)
				libFile.copylinkSync(partConfig.srclink, filename);
			continue;
		}
		if(!partConfig.main){
			return self.error(filename + "\nno main in "+JSON.stringify(partConfig));
		}
// gen env //
		var env = globalEnv;
		if(partConfig.env){
			env = libObject.getByKey(globalEnv, partConfig.env);
			if(!env){
				return self.error("envkey not existed: " + partConfig.env);
			}
			if(typeof env != "object")
				env = {
					name: partConfig.env.match(/([^\.]+)$/)[1],
					val: env
				};
		}
		var tenv = libObject.copy1(env);
		env = tenv;
		env.global = globalEnv;

// get type
		var type;
		if(env.type){
			type = env.type;
		}else{
			var m = filename.match(/\.([^.+]+)$/);
			if(m)
				type = m[1];
			else
				type = "js";
		}

// get lib
		if(partConfig.lib){
			var mss = partConfig.lib.split(/[-,]/);
			for(var i in mss){
				var fname =  self.libs[mss[i]];
				if(!fname)
					return self.error("no library named "+mss[i]);
				render({file: self.libs[mss[i]], type: type}, env);
			}
		}

		var ms;
		var keys = Object.keys(partConfig).sort().reverse();
		for(var i in keys){
			var key = keys[i];
			if(!env[key]) env[key] = "";
			if(!reservedKey[key] && !key.match("main") ){
				if(!libObject.isArray(partConfig[key])) {
					log.i(partConfig);
					log.e(key + " is not array");
					return 1;
				}
				partConfig[key].forEach(function(file){
					env[key] += render({file: file, type: type}, env);
				});
			}
		}
		for(var i in keys){
			var key = keys[i];
			if(key.match("main") && key!== "main")
				partConfig[key].forEach(function(file){
					env[key] += render({file: file, type: type}, env);
				});
		}

		var str = "";
		partConfig.main.forEach(function(file){
      str += render({file: file, type: type}, env);
    });

/*
		env.main = str;
		var typefile = self.rootDir + "/lang/" + type;
		if(fs.existsSync(typefile)){
			str = render({file: type, type: type}, env);
		}else{
			log.e(type  + "not defined");
		}
*/

		if(fs.existsSync(filename))
			fs.unlinkSync(filename);
		fs.writeFileSync(filename, str, {mode: 0444});

	}
	return 0;
}
