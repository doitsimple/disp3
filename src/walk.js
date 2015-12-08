var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var tmpl = require("./tmpl");
var utils = require("./utils");
var checkName = utils.checkName;
var log = require("../lib/nodejs/log");
var regex = /%(~?)([^%@~]+)?(~?)(?:@([^%@~]+))?(?:%([a-zA-Z0-9_-]+)?(?:@([^%@~]+))?)?(?:%([^%]+))?%/;
var replaceRegex = /%\S*%/;
module.exports = {
	regex: regex,
	walk: walk,
	checkName: checkName
}

function walk(srcdir, tardir){
	var self = this;
	if(walkDir.call(self, {
		name: "",
		dir: "",
		basedir: srcdir,
		tname: "",
		tdir: tardir || "",
		env: self.global, 
		envkey: ""
	})) return 1;
	return 0;
}
function walkDir(params){
	var self = this;
	if(params.dir && params.dir != "."){
		params.fullpath = params.basedir +"/"+ params.dir+"/"+params.name;
		params.dirpath = params.basedir +"/"+ params.dir;
	}
	else if(params.name){
		params.fullpath = params.basedir+ "/"+params.name;
		params.dirpath = params.basedir;
	}
	else{
		params.fullpath = params.basedir;
		params.dirpath = params.basedir;
	}
	params.relativepath = path.relative(".", params.fullpath);
	if(!checkName(params.name)) return 0;
	// get all name info
	if(matchName.call(self, params)) return 1;
	if(params.ignore)
		return 0;

	if(isGenFile.call(self, params)){
		log.v("skip "+ params.fullpath);
		return 0;
	}

	if(params.isdir){
		var subnames = fs.readdirSync(params.fullpath);
		for(var i=0; i<subnames.length; i++){
			var subname = subnames[i];
			if(params.multi){
				for(var key in params.env){
					if(params.selector &&
						 !matchEnv(params.env[key], params.selector))
						continue;
					var tmpname = params.tname.replace(replaceRegex, key);
					if(walkDir.call(self, {
						name: subname,
						dir: params.dir?params.dir + "/" + params.name:params.name,
						basedir: params.basedir,
						tname: subname,
						tdir: params.tdir?params.tdir + "/" + tmpname:tmpname,
						env: params.env[key],
						envkey: params.envkey?params.envkey + "." + key:key
					})) return 1;
				}
			}else{
				if(walkDir.call(self, {
					name: subname,
					dir: params.dir?params.dir + "/" + params.name:params.name,
					basedir: params.basedir,
					tname: subname,
					tdir: params.tdir?params.tdir + "/" + params.tname:params.tname,
					env: params.env,
					envkey: params.envkey
				})) return 1;
			}
		}
	}else{
		if(walkFile.call(self, params)) return 1;
	}
	return 0;
}

function walkFile(params){
	var self = this;
	if(params.multi){
		for(var key in params.env){
			if(params.selector &&
				 !matchEnv(params.env[key], params.selector))
				continue;
			var tmpname = params.tname.replace(replaceRegex, key);
			var rt1 = params.tdir?params.tdir + "/" + tmpname:tmpname;

			if(addGenFileList.call(self, {
				fullpath: params.fullpath,
				tfullpath: rt1,
				envkey: params.envkey?params.envkey+"."+key:key,
				contentkey: params.contentkey,
				tmpl: params.tmpl,
				lib: params.lib
			})) return 1;
		}
		return 0;
	}

	var rt = params.tdir?params.tdir + "/" + params.tname:params.tname;

	if(params.ismatch){
		if(addGenFileList.call(self, {
			fullpath: params.fullpath,
			tfullpath: rt,
			envkey: params.envkey,
			contentkey: params.contentkey,
			tmpl: params.tmpl,
			lib: params.lib
		})) return 1;
	}else if(params.dir != params.tdir || path.relative(params.basedir, ".") ){

		if(!self.filelist[rt]){
			if(params.islink){

				if(addGenFileList.call(self, {
					fullpath: params.fullpath,
					tfullpath: rt,
					static: {srclink: params.fullpath}
				})) return 1;
			}else{

				if(addGenFileList.call(self, {
          fullpath: params.fullpath,
          tfullpath: rt,
          static: {src: params.fullpath}
        })) return 1;
			}
		}
	}else{
		if(!self.filelist[rt]){
			if(params.islink){
				if(addGenFileList.call(self, {
          fullpath: params.fullpath,
          tfullpath: rt,
					static: {selflink: 1}
				})) return 1;
			}else{
				if(addGenFileList.call(self, {
          fullpath: params.fullpath,
          tfullpath: rt,
          static: {self: 1}
        })) return 1;
			}
		}
	}
}
function isGenFile(params){
	var self = this;
	var rpath = params.relativepath;
	if(self.prevFilelist[rpath] && self.prevFilelist[rpath].main)
		return true;
	else
		return false;
}
function matchName(params){
	var self = this;
	var	stat = fs.lstatSync(params.fullpath);
	if(stat.isDirectory()) params.isdir = true;
	if(stat.isSymbolicLink()) params.islink = true;
	var ms;
	if((ms = params.name.match(regex))){
		// dir with %% name
		params.ismatch = true;
		params.isglobal = ms[1];
		var envkey = ms[2] || "";
		params.nullval = ms[3];
		params.selector = ms[4];
		params.contentkey = ms[5] || "main";
		params.tmpl = ms[6];
		params.lib = ms[7];
		if(envkey){
			var val;
			if(params.isglobal){
				val = libObject.getByKey(self.global, envkey);
				params.envkey = envkey;
			}
			else{
				val = libObject.getByKey(params.env, envkey);
				params.envkey = params.envkey?params.envkey + "." + envkey:envkey;
			}
			if(val === undefined)
				return self.error(envkey + " not exist in env: " + params.fullpath + "\n" + JSON.stringify(params.env));

			if(typeof val != "object"){
				if(params.nullval) 
					params.tname = params.name.replace(replaceRegex, "");
				else
					params.tname = params.name.replace(replaceRegex, val);
			}
			var endenvkey = envkey.match(/([^\.]+)$/)[1];
			if(self.froms[endenvkey]){
				var newval = {};
				var from = libObject.getByKey(self.global, self.froms[endenvkey]);
				if(typeof val == "object")
					for(var i in val)
						newval[val[i]] = from[val[i]];
				else
					newval[val] = from[val];
				val = newval;
				if(!params.isglobal)
					params.envkey = self.froms[endenvkey];
			}
			if(typeof val == "object"){
				params.env = val;
				params.multi = true;				
			}
		}else{
			params.tname = params.name.replace(replaceRegex, "");
		}
	}
	if(typeof params.env != "object")
		params.env = {
			name: params.envkey.match(/([^\.]+)$/)[1],
			val: params.env
		};
	
/*
	var fsconfig = self.project.fsconfigs[params.relativepath];
	if(fsconfig)
		libObject.append1(params, fsconfig);
*/
	return 0;
}
function addGenFileList(params){
	var self = this;
//	var fsconfig = self.project.fsconfigs[params.tfullpath];
	var rt;
/*
	if(fsconfig && fsconfig.mv)
		rt = fsconfig.mv;
	else
*/
		rt = params.tfullpath;
	if(!self.filelist[rt]) self.filelist[rt] = {};
	var fileparams = self.filelist[rt];
	if(params.static){
		for(var key in params.static){
			fileparams[key] = params.static[key];
		}
		return 0;
	}
	if(params.envkey){
		if(!fileparams.env)
			fileparams.env = params.envkey;
		else if(fileparams.env != params.envkey){
			log.i(fileparams);
			log.i(params);
			log.e("the same target filename must have the same envkey");
			return 1;
		}
	}
	if(params.contentkey){
		if(!fileparams[params.contentkey])
			fileparams[params.contentkey] = [];
		libArray.pushIfNotExists(fileparams[params.contentkey], 
														 params.fullpath);
	}
	if(params.tmpl)
		fileparams.tmpl = params.tmpl;
	if(params.lib)
		fileparams.lib = params.lib;
	return 0;
}
function matchEnv(localenv, str, i){

	var tokens = str.split(/[-,]/);
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

