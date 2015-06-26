var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var tmpl = require("./tmpl");
var log = require("./log");
var regex =  /%([^%@]+)?(?:@([^%@]+))?(?:%([a-zA-Z0-9_-]+)?(?:@([^%@]+))?)?(?:%([^%]+))?%/;
module.exports.regex = regex;
function walk(dir, tdir, env, genFileList){
	if(!fs.existsSync(dir)){
		log.e(dir + " is not exist");
		return false;
	}
	if(!tdir){
		log.e("no target dir");
		return false;
	}
	if(!env){
		log.e("no env");
		return false;
	}
	if(!genFileList){
		log.e("no generate file list for output");
		return false;
	}
	if(fs.existsSync(dir + "/.filelist.json"))
		if(!env.filelist){
			env.filelist = libFile.readJSON(dir + "/.filelist.json");			
		}else{
			log.e("multiple .filelist.json in workspace: " + dir + "/.filelist.json");
			return false;
		}
	

	// then iterate file
	return _walk(dir, tdir, env, genFileList, "", env);
};

function _walk(dir, tdir, env, genFileList, penvkey, globalenv){
	//	dir=path.resolve(dir);
	dir=path.relative(".", dir);
	tdir = path.relative(globalenv.project.target, tdir);
	if(!dir) dir=".";
	if(!tdir) tdir=".";

	if(!penvkey) penvkey = "";


	var fsconfigs = globalenv.project.fsconfigs;
	if(fsconfigs){
		var fsconfig;
		if(fsconfigs[dir]){
			fsconfig = fsconfigs[dir];
			if(fsconfig.ignore)
				return true;
			if(fsconfig.mv){
				env.global = globalenv;
				tdir = path.resolve(tmpl.render(fsconfig.mv, env));
			}
		}
		else if(fsconfigs[path.basename(dir)]){
			fsconfig = fsconfigs[path.basename(dir)];
			if(fsconfig.ignoreall){
				return true;
			}
			if(fsconfig.mvall){
				env.global = globalenv;
				tdir = path.relative("." + path.dirname(tdir) + "/" + tmpl.render(fsconfig.mv, env));
			}
		}
	}


	if(fs.existsSync(dir + "/disp-global.json"))
		libObject.extend(globalenv, libFile.readJSON(dir + "/disp-global.json"));
	if(fs.existsSync(dir + "/disp-local.json"))
		libObject.extend(env, libFile.readJSON(dir + "/disp-local.json"));
	if(fs.existsSync(dir + "/disp.json"))
		libObject.extend(env, libFile.readJSON(dir + "/disp.json"));
	/*
	 if(fs.existsSync(dir + "/disp.func")){
	 tmpl.render({file: dir + "/disp.func"}, env);
	 }
	 */
	var files = fs.readdirSync(dir);

	for(var i=0; i<files.length; i++){
		var f = files[i];
		//ignore hidden file or editor backup files
		if(f == "." || f==".filelist.json" || f.match(/~$/) || f[0] == '#' || f.match(/^disp/)
			){
				continue;
			}

		var p = path.relative(".", dir + '/' + f);
		var t, rt;

		//check if is directory, _walk
		var	stat = fs.lstatSync(p);
		if(stat.isDirectory() && !stat.isSymbolicLink()){
			if((ms = f.match(regex))){
				// dir with %% name
				var envkey = ms[1];
				var matchStr = ms[2];
				var contentkey = ms[3];
				var stemp = ms[4];
				var sdir = ms[5];
				if(envkey && envkey[0] == "~") penvkey = "";
				var envlist = getEnv(env, globalenv, envkey);
				if(!contentkey) contentkey = "main";
				if(typeof(envlist) != "object"){
					t = tdir + '/' + f.replace(/%\S+%/, envlist);
					if(!_walk(p, t, env, genFileList, penvkey, globalenv)){
						log.e("walk " + p + " failed");
						return false;
					}
				}else{
					var enums;
					if(envlist.from){
						enums = envlist;
						envlist = libObject.getByKey(globalenv, enums.from);
					}
					for(var name in envlist){
						if(enums && libArray.indexOf(enums, name)==-1)
							continue;
						if(matchStr && !matchEnv(envlist[name], matchStr))
							continue;
						
						t = tdir + '/' + f.replace(/%\S+%/, name);
						var nenvkey;
						if(enums) nenvkey = enums.from + "." + name;
						else nenvkey = penvkey + "." + envkey + "." + name;
						if(!_walk(p, t, envlist[name], genFileList, nenvkey, globalenv)){
							log.e("walk " + p + " failed");
							return false;
						}
					}
				}
			}else{
				// normal dir
				t = tdir + "/" + f;
				if(!_walk(p, t, env, genFileList, penvkey, globalenv)){
          log.e("walk " + p + " failed");
          return false;
        }
			}
			continue;
		}


		// check if the file is the generated file
		if(isGenFile(env.filelist, p)){
			log.v("skip "+ p);
			continue;
		}
		// check if the file should be ignored (folder already checked before)
		var ffsconfigs = globalenv.project.fsconfigs;
		if(ffsconfigs && ffsconfigs[p]){
			var ffsconfig = ffsconfigs[p];
			if(ffsconfig.ignore){
				continue;
			}
		}

		// match filename
		var ms;
		if((ms = f.match(regex))){
			var envkey = ms[1];
			var matchStr = ms[2];
			var contentkey = ms[3];
			var stemp = ms[4];
			var sdir = ms[5];
			if(envkey && envkey[0] == "~") penvkey = "";
			var envlist = getEnv(env, globalenv, envkey);
			if(!contentkey) contentkey = "main";

			if(sdir){
				var mss = sdir.split("-");
				for(var k=0; k<mss.length; k++){
					var srcDir = path.resolve(__dirname + "/../lib/" + mss[k]);
					if(fs.existsSync(srcDir)){
						libFile.forEachFile(srcDir, function(f2){
							if(!f2.match(/~$/) && f2[0] != '#' ){
								t = tdir + "/" + f2;
								rt=path.relative(".",t);
								if(!genFileList[rt]) genFileList[rt] = {};
								if(!genFileList[rt][contentkey])
									genFileList[rt][contentkey] = [];
								genFileList[rt][contentkey].push(path.resolve(srcDir + "/" + f2));
							}
						});
					}
				}
				continue;
			}

			if(typeof envlist != "object"){
				var name = envlist;
				t = tdir + '/' + f.replace(/%\S+%/, name);
				rt = path.relative(".", t);
				if(!genFileList[rt]) genFileList[rt] = {};
				if(penvkey)
					genFileList[rt].env = penvkey;
				if(!genFileList[rt][contentkey])
					genFileList[rt][contentkey] = [];
				genFileList[rt][contentkey].push(p);
			}else{
				var enums;
				if(envlist.from){
					enums = envlist;
					envlist = libObject.getByKey(globalenv, enums.from);
				}
				for(var name in envlist){
					if(enums && libArray.indexOf(enums, name)==-1)
						continue;
					if(matchStr && !matchEnv(envlist[name], matchStr))
						continue;
					t = tdir + '/' + f.replace(/%\S+%/, name);
					rt = path.relative(".", t);
					if(!genFileList[rt]) genFileList[rt] = {};
					if(enums)
						genFileList[rt].env = enums.from + "." + name;
					else
						genFileList[rt].env = penvkey + "." + envkey+ "." + name;
					if(!genFileList[rt][contentkey])
						genFileList[rt][contentkey] = [];
					genFileList[rt][contentkey].push(p);
				}
			}
		}else if(dir != tdir){
			t = tdir + '/' + f;
			rt = path.relative(".", t);
			if(!genFileList[rt]){
				if(stat.isSymbolicLink())
					genFileList[rt] = {srclink: p};
				else
					genFileList[rt] = {src: p};
			}
		}else{
			rt = path.relative(".", p);
			if(!genFileList[rt])
				genFileList[rt] = {self: 1};
		}
	};
	return true;
}
function getEnv(env, globalenv, envkey){
	var envlist;
	if(envkey){
		if(envkey[0] == "~")
			envlist = libObject.getByKey(globalenv, envkey.substr(1));
		else
			envlist = libObject.getByKey(env, envkey);
	}
	if(!envlist) envlist = "";
	return envlist;
}
function isGenFile(list, file){
	if(!list) return null;
	var rpath = path.relative(".", file);
	if(list[file] && list[file].main)
		return true;
	else
		return false;
}
function matchEnv(localenv, str, i){

	var tokens = str.split(",");
	if(!i) i=0;
	if(!tokens[i])
		return true;

	switch(tokens[i]){
		case "eq":
			if(tokens[i+1] === undefined || tokens[i+2] === undefined
				 || libObject.getByKey(localenv, tokens[i+1]) != tokens[i+2]){
				return false;
			}
			i+=3;
			break;
		case "ne":
			if(tokens[i+1] === undefined || tokens[i+2] === undefined
				 || libObject.getByKey(localenv, tokens[i+1]) === tokens[i+2]){
				return false;
			}
			i+=3;
			break;
		case "lt":
			i+=3;
			break;
		case "gt":
			i+=3;
			break;
		case "in":
			if(tokens[i+1] === undefined || tokens[i+2] === undefined 
				 || libArray.indexOf(libObject.getByKey(localenv, tokens[i+1]), 
														 tokens[i+2]) == -1){
				return false;
			}
			i+=3;
			break;
		case "ex":
			if(tokens[i+1] === undefined
				 || !libObject.getByKey(localenv, tokens[i+1])){
        return false;
      }
      i+=2;
			break;
		case "nex":
			if(tokens[i+1] === undefined
				 || libObject.getByKey(localenv, tokens[i+1])){
        return false;
      }
      i+=2;
			break;
		default: {
			if(localenv.type && localenv.type == tokens[i])
				i+=1;
			else if(localenv.mods && libArray.indexOf(localenv.mods, tokens[i]) != -1)
				i+=1;
			else
				return false;
		}
	}
	return matchEnv(localenv, str, i);
}

module.exports.walk = walk;
