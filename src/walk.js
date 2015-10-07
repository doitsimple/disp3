var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var tmpl = require("./tmpl");
var utils = require("./utils");
var log = require("./log");
var regex = /%(~?)([^%@~]+)?(~?)(?:@([^%@~]+))?(?:%([a-zA-Z0-9_-]+)?(?:@([^%@~]+))?)?(?:%([^%]+))?%/;
module.exports = {
	regex: regex,
	walk: walk,
	readFileList: readFileList,
	readDispJsons: readDispJsons
}
function readDispJsons(){
	var self = this;
	for(var navpath in self.navpaths){
		// then iterate file		
		if(walk.call(self, {
			name: "",
			dir: "",
			basedir: navpath,
			tname: "",
			tdir: "",
			env: self.global, 
			envkey: ""
		})) return 1;
	}
	return 0;
}
function readFileList(){
	var self = this;
	for(var navpath in self.navpaths){
		// then iterate file		
		if(walk.call(self, {
			name: "",
			dir: "",
			basedir: navpath,
			tname: "",
			tdir: "",
			env: self.global, 
			envkey: ""
		}, 1)) return 1;
	}
	log.v("success");
	return 0;
}
function walk(params, addgenflag){
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
	if(!addgenflag)
		if(readDispJson.call(self, params)) return 1;
	if(!checkName(params.name)) return 0;
	// get all name info
	if(matchName.call(self, params)) return 1;
	if(params.ignore)
		return 0;
	/*
	 if(params.mv){
	 params.tname = path.basename(params.mv);
	 params.tdir = path.dirname(params.mv);
	 }
	 */
	if(isGenFile.call(self, params)){
		log.v("skip "+ params.fullpath);
		return 0;
	}
	if(params.isdir){
		if(params.lib){
			var rt;
			if(params.tdir && params.tname)
				rt = params.tdir + "/" + params.tname;
			else if(params.tdir)
				rt = params.tdir;
			else if(params.tname)
				rt = params.tname;
			else
				rt = "";
			var mss = params.lib.split(/[-,]/);
			for(var k=0; k<mss.length; k++){
				var srcDir = path.relative(".", __dirname + "/../lib/" + mss[k]);
				if(fs.existsSync(srcDir)){
					var list = libFile.readdirNotDirSync(srcDir);
					for(var i in list){
						var f2 = list[i];
						if(checkName(f2)){
							if(addGenFileList.call(self, {
								fullpath: path.relative(".", srcDir + "/" + f2),
								tfullpath: rt + "/" + f2,
								envkey: params.envkey,
								contentkey: params.contentkey,
								tmpl: params.tmpl
							})) return 1;
						}
					};
				}
			}
			return 0;
		}
		var subnames = fs.readdirSync(params.fullpath);
		/*
		 if(self.addFiles[params.relativepath]){
		 subnames = subnames.concat(self.addFiles[params.relativepath]);
		 }
		 */
		for(var i=0; i<subnames.length; i++){
			var subname = subnames[i];
			if(params.multi){
				for(var key in params.env){
					if(params.selector &&
						 !matchEnv(params.env[key], params.selector))
						continue;
					var tmpname = params.tname.replace(/%\S+%/, key);
					if(walk.call(self, {
						name: subname,
						dir: params.dir?params.dir + "/" + params.name:params.name,
						basedir: params.basedir,
						tname: subname,
						tdir: params.tdir?params.tdir + "/" + tmpname:tmpname,
						env: params.env[key],
						envkey: params.envkey?params.envkey + "." + key:key
					}, addgenflag)) return 1;
				}
			}else{
				if(walk.call(self, {
					name: subname,
					dir: params.dir?params.dir + "/" + params.name:params.name,
					basedir: params.basedir,
					tname: subname,
					tdir: params.tdir?params.tdir + "/" + params.tname:params.tname,
					env: params.env,
					envkey: params.envkey
				}, addgenflag)) return 1;
			}
		}
	}else{
		if(addgenflag)
			if(walkFile.call(self, params)) return 1;
	}
	return 0;
}

function readDispJson(params){
	var self = this;
	var dir = params.dirpath;
	if(!path.relative(".",dir)) return 0;
	if(fs.existsSync(dir + "/disp.render.json")){
		if(extendDispJson.call(
			self, params, params.env,
			JSON.parse(tmpl.render({file: dir + "/disp.render.json"},
									params.env, true))))
			return 1;
	}
	if(fs.existsSync(dir + "/disp.json")){
		if(extendDispJson.call(
			self, params, params.env,
			libFile.readJSON(dir + "/disp.json")))
			return 1;
	}
	return 0;
}
function extendDispJson(params, env, dispJson){
	var self = this;
	var dir = params.dirpath;
	if(!dispJson) return self.error("no disp json");
	if(dispJson.tmpls){
		for(var tmplKey in dispJson.tmpls){
			var p = path.resolve(dir + "/" + dispJson.tmpls[tmplKey]);
			dispJson.tmpls[tmplKey] = p;
			self.global.tmpls[tmplKey] = p;
		}
	}
	utils.extend(params.env, dispJson);
}
function walkFile(params){
	var self = this;
	if(params.multi){
		for(var key in params.env){
			if(params.selector &&
				 !matchEnv(params.env[key], params.selector))
				continue;
			var tmpname = params.tname.replace(/%\S+%/, key);
			var rt1 = params.tdir?params.tdir + "/" + tmpname:tmpname;

			if(addGenFileList.call(self, {
				fullpath: params.fullpath,
				tfullpath: rt1,
				envkey: params.envkey?params.envkey+"."+key:key,
				contentkey: params.contentkey,
				tmpl: params.tmpl		
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
			tmpl: params.tmpl		
		})) return 1;
	}else if(params.dir != params.tdir || path.relative(params.basedir, ".") ){
		if(!self.filelist[rt]){
			if(params.islink)
				if(addGenFileList.call(self, {
					fullpath: params.fullpath,
					tfullpath: rt,
					static: {srclink: params.fullpath}
				})) return 1;
			else
				if(addGenFileList.call(self, {
          fullpath: params.fullpath,
          tfullpath: rt,
          static: {src: params.fullpath}
        })) return 1;
		}
	}else{
		if(!self.filelist[rt]){
			if(params.islink)
				if(addGenFileList.call(self, {
          fullpath: params.fullpath,
          tfullpath: rt,
					static: {selflink: 1}
				})) return 1;
			else
				if(addGenFileList.call(self, {
          fullpath: params.fullpath,
          tfullpath: rt,
          static: {self: 1}
        })) return 1;
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
					params.tname = params.name.replace(/%\S+%/, "");
				else
					params.tname = params.name.replace(/%\S+%/, val);
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
			params.tname = params.name.replace(/%\S+%/, "");
		}
	}
	if(typeof params.env != "object")
		params.env = {
			name: params.envkey.match(/([^\.]+)$/)[1],
			val: params.env
		};
	

	var fsconfig = self.fsconfigs[params.relativepath];
	if(fsconfig)
		libObject.append1(params, fsconfig);
	return 0;
}
//return 1 check failed
function checkName(f){
	if(f == "." || f.match(/~$/) || f[0] == '#' || f.match(/^disp/)){
		return 0;
	}
	return 1;
}
function addGenFileList(params){
	var self = this;
	var fsconfig = self.fsconfigs[params.tfullpath];
	var rt;
	if(fsconfig && fsconfig.mv)
		rt = fsconfig.mv;
	else
		rt = params.tfullpath;
	if(!self.filelist[rt]) self.filelist[rt] = {};
	if(params.static){
		for(var key in params.static){
			self.filelist[rt][key] = params.static[key];
		}
		return 0;
	}
	if(params.envkey){
		if(!self.filelist[rt].env)
			self.filelist[rt].env = params.envkey;
		else if(self.filelist[rt].env != params.envkey){
			log.i(self.filelist[rt]);
			log.i(params);
			log.e("the same target filename must have the same envkey");
			return 1;
		}
	}
	if(params.contentkey){
		if(!self.filelist[rt][params.contentkey])
			self.filelist[rt][params.contentkey] = [];
		libArray.pushIfNotExists(self.filelist[rt][params.contentkey], 
														 params.fullpath);
	}
	if(params.tmpl)
		self.filelist[rt].tmpl = params.tmpl;
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

