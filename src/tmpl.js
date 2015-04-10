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
	var str;
	if(typeof config == "string"){
		str = config;
	}else{
		if(tmplCache[config.file]){
			str = tmplCache[config.file];
		}else{
			if(config.str && config.file) {
				str = config.str;
				tmplCache[config.file] = str;
			}
			else if(config.file){
				str = libFile.readString(config.file);
			}
			else if(config.str){
				str = config.str;
			}else{
				log.e("wrong param to render");
				return "";
			}
		}
	}
	data.local = data;
	data.$ = methods;
	var p=[];
	var win, wout;
	var evalstr = "p.push('";
	with(data){
		str = str.replace(/\r/g,"");
		//		str = str.
		//			replace(/\s*(\^\^[^=]((?!\$\$).)*\$\$)\s*/g, "$1");
		//replace multiple line [\s but not \n]* [^^] [not =] [not $$]* [$$] [\s*\n] 

		str.split("\^\^").forEach(function(sub, i){
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
				.replace(/\\([\[\]\{\}a-zA-Z0-9'])/g, "\\\\$1")
				.replace(/\n/g, "\\n")
				.replace(/'/g, "\\'")
				.replace(/\\([\"\?\*])/g, "\\\\\\$1");

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
			log.e(e.stack);
			return "";
//			eval(evalstr);
		}

		return p.join('');
	}
}
module.exports.generate = generate;
function generate(fileList, globalEnv){
	for (var filename in fileList){
		libFile.mkdirpSync(path.dirname(filename)); // should have a more efficient way
		var partConfig = fileList[filename];
		if(partConfig.self){
			continue;
		}
		if(partConfig.src){
			if(partConfig.src != filename)
				libFile.copySync(partConfig.src, filename);
			continue;
		}
		if(!partConfig.main){
			log.e("no main in "+JSON.stringify(partConfig));
			return false;
		}
			
		var env = globalEnv;
		if(partConfig.env){
			env = libObject.getByKey(globalEnv, partConfig.env);
		}
		var ms;
		for(var key in partConfig){
			if(!env[key]) env[key] = "";
			if(key != "env" && key != "main" && key != "src" && key != "self"){
				partConfig[key].forEach(function(file){
					env[key] += render({file: file}, env);
				});
			}
		}
		env.global = globalEnv;
		var str = "";
		partConfig.main.forEach(function(file){
      str += render({file: file}, env);			
    });

		fs.writeFileSync(filename, str);
	}
	return true;
}
