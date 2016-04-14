var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("../lib/nodejs/log");
var methods = {};
libObject.extend1(methods, libString);
libObject.extend1(methods, libArray);
libObject.extend1(methods, libObject);
libObject.extend1(methods, libFile);
module.exports.extendMethods = extendMethods;
function extendMethods(name, fn){
	methods[name] = fn;	
}
var reservedKey = {
	"$": 1,
	"argv": 1,
	"deps": 1,
	"env": 1,
	"file": 1,
	"global": 1,
	"inherents": 1,
	"key": 1,
	"lib": 1,
	"local": 1,
	"main": 1,
	"name": 1,
	"origin": 1,
	"p": 1,
	"parent": 1,
	"selflink": 1,
	"self": 1,
	"src": 1,
	"srclink": 1,
	"type": 1
}


module.exports.reservedKey = reservedKey;
var tmplCache = {};
module.exports.render = render;
function render(config, data){
	var originstr;
	if(typeof config == "string"){
		originstr = config;
	}else{
		if(tmplCache[config.file]){
			originstr = tmplCache[config.file];
		}else{
			if(config.file){
				if(config.str){
					originstr = config.str;
				}else{
					originstr = libFile.readString(config.file);
				}
				tmplCache[config.file] = originstr;
			}
			else if(config.str){
				originstr = config.str;
			}else{
				log.e("wrong param to render");
				return "";
			}
		}
		if(config.pre)
			originstr = config.pre + originstr;
		if(config.post)
			originstr += config.post;
		
	}


// init data
	if(!data){
		log.e("render with undefined data");
		return "";
	};
	if(typeof data !="object"){
		data = {name: data};
	}
	if(data.p || data.originstr || data.evalstr){
		log.e(config);
		log.e("variable p, originstr, evalstr is not allowed!!!!");
		return "";
	}
	data.local = data;
	data.origin = {};
	for(var key in data.local){
		if(reservedKey[key]) continue;
		data.origin[key] = data.local[key];
	}
	data.$ = libObject.copy1(methods);
	if(data.extend)
		libObject.extend1(data.$, data.extend);
	if(config.file)
		data.file = config.file;
	data.p=[];
///////////

	var win, wout;
	var evalstr = "p.push('";
	with(data){
		originstr = originstr.replace(/\r/g,"");
		//		str = str.
		//			replace(/\s*(\^\^[^=]((?!\$\$).)*\$\$)\s*/g, "$1");
		//replace multiple line [\s but not \n]* [^^] [not =] [not $$]* [$$] [\s*\n] 

		originstr.split(/[\t ]*\^\^(?!=)|\^\^(?==)/).forEach(function(sub, i){
			if(i==0){
				win = "";
				wout = sub || "";
			}else{
				var subs;
				if(sub[0] == '=')
					subs = sub.split(/\$\$/);
				else
					subs = sub.split(/\$\$[ \t]*/);
				win = subs[0];
				wout = subs[1] || "";
				if(!win || win[0] != '=') 
					if(wout[0] == '\n')
						wout = wout.substr(1);
			}
			wout = wout
				.replace(/\\([\$\^])/g, "$1")
				.replace(/\\/g, "\\\\")
				.replace(/([\[\]\{\}'])/g, "\\$1")
				.replace(/\n/g, "\\n");


			if(win && win[0] == '='){
				var ms;
//automatic init
				if((ms=win.match(/^=([A-Za-z0-9-]+)$/)))
					if(data[ms[1]] === undefined){
						data[ms[1]] = "";
					}
				if((ms=win.match(/^=~(.*)$/))){
					if(ms[1].match(/:/)){
						win = win.replace(/~(.+)/,"$.eval({$1})");
					}else{
						win = win.replace(/~(.+)/,"$.eval($1)");
					}
				}
				evalstr += (win.replace(/^=(.+)/, "',$1,'") + wout);
			}
			else{
				if(win.match(/~$/)){
					evalstr+=("');" +win.replace(/~$/, "'")+wout+"';p.push('");
				}else{
					evalstr+=("');"+win+";p.push('"+wout);
				}
			}
		});
		evalstr+="');";
		try{
			eval(evalstr);
		}catch(e){
			log.i(evalstr);
			log.i(config.file);
			eval(evalstr);
			return "";

		}
	}
	var rtstr = data.p.join('');
	delete(data.p);
	delete(data.$);	
	if(config.clear){
		delete(data.local);
	}
	return rtstr;
}
