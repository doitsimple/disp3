var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
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
/*
	var fileListModified = {};
	for (var filename in fileList){
		var tmpFilename = filename;
		if(fsconfigs && fsconfigs[filename] && fsconfigs[filename].mv)
			tmpFilename = fsconfigs[filename].mv;
		if(fileListModified[tmpFilename]){
			if(!fileList[filename].self && !fileListModified[tmpFilename].self){
				log.e("duplicate generated "+tmpFilename);
				log.e(fileListModified[tmpFilename]);
				log.e(fileList[filename]);
				return false;
			}else if(!fileList[filename].self){
				fileListModified[tmpFilename] = fileList[filename];
			}
		}else{
			fileListModified[tmpFilename] = fileList[filename];
		}
	}
*/
	if(!fs.existsSync(target))
		libFile.mkdirpSync(target);
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
		tenv.origin = env;
		env = tenv;
		env.global = globalEnv;
		var ms;
		var keys = Object.keys(partConfig).sort().reverse();
		for(var i in keys){
			var key = keys[i];
			if(!env[key]) env[key] = "";
			if(!reservedKey[key] && !key.match("main") ){
				partConfig[key].forEach(function(file){
					env[key] += render({file: file}, env);
				});
			}
		}
		for(var i in keys){
			var key = keys[i];
			if(key.match("main") && key!== "main")
				partConfig[key].forEach(function(file){
					env[key] += render({file: file}, env);
				});
		}

		var str = "";
		partConfig.main.forEach(function(file){
      str += render({file: file}, env);
    });
		if(partConfig.tmpl){
			var tmplPath;
			if(env.tmpls){
				tmplPath = env.tmpls[partConfig.tmpl];
			}
			if(!tmplPath && globalEnv.tmpls)
				tmplPath = globalEnv.tmpls[partConfig.tmpl];
			if(!tmplPath){
				return self.error("no tmpl " + partConfig.tmpl);
			}
			if(fs.existsSync(tmplPath)){	
				env.main = str;
				str = render({file: tmplPath}, env);
			}else{
				return self.error("template file: " + tmplPath + " not exist!!!");
			}
		}


		if(fs.existsSync(filename))
			fs.unlinkSync(filename);
		fs.writeFileSync(filename, str, {mode: 0444});

	}
	return 0;
}
