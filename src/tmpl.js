var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var methods = {};
libObject.extend1(methods, libString);
libObject.extend1(methods, libArray);
libObject.extend1(methods, libObject);
libObject.extend1(methods, libFile);

var tmplCache = {};
module.exports.render = render;
function render(config, data){
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
				console.error("wrong param to render");
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
			console.error(config);
			console.error(e.stack);
			return "";
//			eval(evalstr);
		}

		return p.join('');
	}
}
module.exports.generate = generate;
function generate(fileList, globalEnv){
	for (var filename in fileList){
		var partConfig = fileList[filename];
		if(!partConfig.main){
			console.error("no main in "+JSON.stringify(partConfig));
			return 0;
		}
			
		var env = globalEnv;
		if(partConfig.env){
			env = libObject.getByKey(globalEnv, partConfig.env);
		}
		for(var key in partConfig){
			if(key != "env" && key != "main")
				env[key] = libFile.readString(partConfig[key]);
		}
		env.global = globalEnv;
		var str = render({file: partConfig.main}, env);
		if(str)
			fs.writeFileSync(filename, str); 
	}
	return 1;
}
