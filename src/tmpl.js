var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var methods = {};
libObject.extend1(methods, libString);
libObject.extend1(methods, libArray);
libObject.extend1(methods, libObject);
libObject.extend1(methods, libFile);

var tmplCache = {};
module.exports.render = render;
function render(config, data){
	if(!data){
		log.e("render with undefined data");
		return "";
	};
	if(data.p || data.originstr || data.evalstr){
		log.e(config);
		log.e("variable p, originstr, evalstr is not allowed!!!!");
		return "";
	}
	var originstr;
	if(typeof config == "string"){
		originstr = config;
	}else{
		if(tmplCache[config.file]){
			originstr = tmplCache[config.file];
		}else{
			if(config.str && config.file) {
				originstr = config.str;
				tmplCache[config.file] = originstr;
			}
			else if(config.file){
				originstr = libFile.readString(config.file);
			}
			else if(config.str){
				originstr = config.str;
			}else{
				log.e("wrong param to render");
				return "";
			}
		}
	}
	data.local = data;
	data.$ = methods;
	data.p=[];

	var win, wout;
	var evalstr = "p.push('";
	with(data){
		originstr = originstr.replace(/\r/g,"");
		//		str = str.
		//			replace(/\s*(\^\^[^=]((?!\$\$).)*\$\$)\s*/g, "$1");
		//replace multiple line [\s but not \n]* [^^] [not =] [not $$]* [$$] [\s*\n] 

		originstr.split("\^\^").forEach(function(sub, i){
			if(i==0){
				win = "";
				wout = sub || "";
			}else{
				var subs = sub.split("\$\$");
				win = subs[0];
				wout = subs[1] || "";
			}

			wout = wout
				.replace(/\n[\t ]+$/, "\n") //remove \s after last \n
				.replace(/^[\t ]*\n/, "") // remove \s before/and first \n
				.replace(/\\([\[\]\{\}a-zA-Z0-9\+'])/g, "\\\\$1")
				.replace(/\n/g, "\\n")
				.replace(/'/g, "\\'")
				.replace(/\\([\"\?\*\/])/g, "\\\\\\$1");

			if(win && win[0] == '='){
				var ms;
//automatic init
				if((ms=win.match(/^=([A-Za-z0-9-]+)$/)))
					if(!data[ms[1]]){
						data[ms[1]] = "";
					}
				evalstr += (win.replace(/^=(.+)/, "',$1,'") + wout);
			}
			else{
				evalstr+=("');"+win+";p.push('"+wout);
			}
		});
		evalstr+="');";
		try{
			eval(evalstr);
		}catch(e){
			log.e(config);
			log.e(e.stack);
			eval(evalstr);
			return "";

		}
	}
	var rtstr = data.p.join('');
	delete(data.p);
	return rtstr;
}
var reservedKey = {
	"env": 1,
	"src": 1,
	"srclink": 1,
	"self": 1,
	"tmpl": 1
}
module.exports.generate = generate;
function generate(fileList, globalEnv){

/* check fsconfigs */
	var fsconfigs;
	var target;
	if(globalEnv.project){
		fsconfigs = globalEnv.project.fsconfigs;
		target = globalEnv.project.target;
	}
	target = target || ".";

	var fileListModified = {};
	for (var filename in fileList){
		var tmpFilename = filename;
		if(fsconfigs && fsconfigs[filename] && fsconfigs[filename].mv)
			tmpFilename = fsconfigs[filename].mv;
		if(fileListModified[tmpFilename] && fileListModified[tmpFilename].self){
			log.e("duplicate generated "+tmpFilename);
			log.e(fileListModified[tmpFilename]);
			log.e(fileList[filename]);
			return false;
		}
		fileListModified[tmpFilename] = fileList[filename];
	}
	fs.writeFileSync(target+"/.filelist.json", JSON.stringify(fileListModified, undefined, 2));

/* generate file */
	for (var orifilename in fileListModified){
		var partConfig = fileListModified[orifilename];
		filename = target + "/" + orifilename;

		libFile.mkdirpSync(path.dirname(filename)); // should have a more efficient way
/*todo sync*/
/**/

		if(partConfig.self){
			if(globalEnv.project.target != "."){
				libFile.copySync(orifilename, filename);
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
			log.e("no main in "+JSON.stringify(partConfig));
			return false;
		}
			
		var env = globalEnv;
		if(partConfig.env){
			env = libObject.getByKey(globalEnv, partConfig.env);
			if(!env){
				log.e("envkey not existed: " + partConfig.env);
				return 0;
			}
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
			if(env.tmpl)
				tmplPath = env.tmpl[partConfig.tmpl];
			if(!tmplPath && globalEnv.tmpl)
				tmplPath = globalEnv.tmpl[partConfig.tmpl];
			if(!tmplPath){
				log.e("no tmpl " + partConfig.tmpl);
				return false;
			}
			if(fs.existsSync(tmplPath)){	
				env.main = str;
				str = render({file: tmplPath}, env);
			}else{
				log.e("template file: " + tmplPath + " not exist!!!");
			}
		}


		if(fs.existsSync(filename))
			fs.unlinkSync(filename);
		fs.writeFileSync(filename, str, {mode: 0444});
	}
	return true;
}
