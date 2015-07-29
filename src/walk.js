var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var tmpl = require("./tmpl");
var log = require("./log");
var regex = /%(~?)([^%@]+)?(?:@([^%@]+))?(?:%([a-zA-Z0-9_-]+)?(?:@([^%@]+))?)?(?:%([^%]+))?%/;
module.exports = {
	regex: regex,
	walk: walk,
	readFileList: readFileList
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
		})) return 1;
	}
	return 0;
}
function walk(params){
/* 
/home/zyp/xx/yy/file
 basedir: /home/zyp/xx
 dir: /yy/
 name: file
 tname:
 tdir:
 env: {}
 envkey: env from global
*/
	var self = this;
	if(typeof params.env != "object")
		params.env = {name: params.env};
	if(checkName(params.name)) return 0;

// get all name info
	var nameinfo = matchName.call(self, params);
	if(nameinfo.ignore)
		return 0;

	if(nameinfo.mv){
		params.tname = path.basename(nameinfo.mv);
		params.tdir = path.dirname(nameinfo.mv) + "/";
	}
	if(isGenFile.call(self, params)){
		log.v("skip "+ nameinfo.fullpath);
		return 0;
	}
	if(nameinfo.isdir){
		if(nameinfo.src)
			log.v("src with dir to be implemented");		
		readDispJson.call(self, params);
		var subnames = fs.readdirSync(nameinfo.fullpath);
		for(var i=0; i<subnames.length; i++){
			var subname = subnames[i];
			if(nameinfo.multi){
				for(var key in nameinfo.env){
					if(nameinfo.selector &&
						 !matchEnv(nameinfo.key[key], nameinfo.selector))
						continue;
					var tmpname = nameinfo.name.replace("/%\S+%/", key);
					if(walk.call(self, {
						name: subname,
						dir: params.dir?params.dir + "/" + nameinfo.name:nameinfo.name,
						basedir: params.basedir,
						tname: subname,
						tdir: params.tdir?params.tdir + "/" + tmpname:tmpname,
						env: nameinfo.env[key],
						envkey: nameinfo.envkey
					})) return 1;
				}
			}else{
				if(walk.call(self, {
					name: subname,
					dir: params.dir?params.dir + "/" + nameinfo.name:nameinfo.name,
					basedir: params.basedir,
					tname: subname,
					tdir: params.tdir?params.tdir + "/" + nameinfo.name:nameinfo.name,
					env: nameinfo.env,
					envkey: nameinfo.envkey
				})) return 1;
			}
		}
	}else{
		walkFile.call(self, params, nameinfo);
	}
	return 0;
}
function readDispJson(params){
	var self = this;
	var dir = params.dir;
	if(fs.existsSync(dir + "/disp-global.json"))
		libObject.extend(self.global, libFile.readJSON(dir + "/disp-global.json"));
	if(fs.existsSync(dir + "/disp-local.json"))
		libObject.extend(params.env, libFile.readJSON(dir + "/disp-local.json"));
	if(fs.existsSync(dir + "/disp.json")){
		var dispJson = libFile.readJSON(dir + "/disp.json");
		if(dispJson.tmpl){
			for(var tmplKey in dispJson.tmpl){
				dispJson.tmpl[tmplKey] = 
					path.resolve(dir + "/" + dispJson.tmpl[tmplKey]);
			}
		}
		libObject.extend(params.env, dispJson);		
	}
}
function walkFile(params, nameinfo){
	var self = this;
	if(nameinfo.src){
		var mss = nameinfo.src.split(/[-,]/);
		for(var k=0; k<mss.length; k++){
			var srcDir = path.relative(".", __dirname + "/../lib/" + mss[k]);
			if(fs.existsSync(srcDir)){
				libFile.forEachFile(srcDir, function(f2){
					if(!f2.match(/~$/) && f2[0] != '#'){
						addGenFileList.call(self, {
							name: f2,
							dir: srcDir + f2,
							tname: f2,
							tdir: params.tdir,
							envkey: nameinfo.envkey,
							contentkey: nameinfo.contentkey,
							tmpl: nameinfo.tmpl
						});
					}
				});
			}
		}
		return 0;
	}
	if(nameinfo.ismatch){
		addGenFileList.call(self, {
			name: params.name,
			dir: params.dir,
			tname: nameinfo.name,
			tdir: params.tdir,
			envkey: nameinfo.envkey,
			contentkey: nameinfo.contentkey,
			tmpl: nameinfo.tmpl			
		});
	}else if(params.dir != params.tdir){
		var rt = params.tdir + params.tname;
		if(!self.filelist[rt]){
			if(nameinfo.islink)
				self.filelist[rt] = {srclink: params.dir + params.name};
			else
				self.filelist[rt] = {src: params.dir + params.name};
		}
	}else{
		var rt = params.dir + params.name;
		if(!self.filelist[rt])
			self.filelist[rt] = {self: 1};
	}
}
function isGenFile(params){
	var self = this;
	var t = params.tdir + params.tname;
	if(self.prevFilelist[t] && self.prevFilelist[t].main)
		return true;
	else
		return false;
}
function matchName(params){
	var self = this;
	var json = {};
	var fullpath = params.basedir +"/"+ params.dir+ "/"+params.name;
	json.fullpath = fullpath;
	var	stat = fs.lstatSync(fullpath);
	if(stat.isDirectory()) json.isdir = true;
	if(stat.isSymbolicLink()) json.islink = true;
	var ms;
	if((ms = params.name.match(regex))){
		// dir with %% name
		json.ismatch = true;
		json.isglobal = ms[1];
		json.envkey = ms[2] || "";
		json.selector = ms[3];
		json.contentkey = ms[4] || "main";
		json.tmpl = ms[5]; 
		json.src = ms[6]; 
		if(json.envkey){
			var val;
			if(json.isglobal)
				val = libObject.getByKey(self.global, json.envkey);
			else{
				val = libObject.getByKey(params.env, json.envkey);
				json.envkey = params.envkey + "." + json.envkey;
			}
			if(typeof val != "object"){
				json.name = params.name.replace(/%\S+%/, val);
			}
			else{
				json.env = val;
				json.multi = true;
			}
		}else{
			json.name = params.name.replace(/%\S+%/, "");
		}
	}
	if(!json.env)
		json.env = params.env;
	if(!json.envkey)
		json.envkey = params.envkey;
	if(!json.name)
		json.name = params.name;

	var fsconfig = self.fsconfigs[params.name];
	if(fsconfig)
		libObject.append1(json, fsconfig);
	return json;
}
function checkName(f){
	if(f == "." || f==".filelist.json" || f.match(/~$/) || f[0] == '#' || f.match(/^disp/)){
		return 1;
	}
	return 0;
}
function addGenFileList(params){
	var self = this;
	var rt = params.tdir + params.tname;
	if(!self.filelist[rt]) self.filelist[rt] = {};
	if(!self.filelist[rt][params.contentkey])
		self.filelist[rt][params.contentkey] = [];
	libArray.pushIfNotExists(self.filelist[rt][params.contentkey], 
													 params.dir + params.name);
	if(params.envkey)
		self.filelist[rt].env = params.envkey;
	if(params.tmpl)
		self.filelist[rt].tmpl = params.tmpl;
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

