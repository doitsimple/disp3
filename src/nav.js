var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");

module.exports.getNavPaths = getNavPaths;

function isGenFile(file){
	if(!generateFileListCache.genFiles) return false;
	var rpath = path.relative(generateFileListCache.root, file);
	return generateFileListCache.genFiles[rpath];
}

function addParams(config, defaultConfig){
	if(!config) {config = defaultConfig; return; }
	libObject.iterate2(defaultConfig, config, function(key, itConfig, itConfig2){
		if(!itConfig2.hasOwnProperty(key)){
			if(typeof itConfig2[key] == "object"){
				console.error(key + " should not be object");
				process.exit(1);
			}
			itConfig2[key] = itConfig[key];
		}
	}, function(key, itConfig, itConfig2){
		if(!itConfig2.hasOwnProperty(key)){
			itConfig2[key] = itConfig[key];
		}else if(libObject.isArray(itConfig2[key])){
			itConfig[key].forEach(function(v){
				itConfig2[key].push(v);
			});
		}else{
			var tmpVal = itConfig2[key];
			itConfig2[key] = [tmpVal];
			itConfig[key].forEach(function(v){
				itConfig2[key].push(v);
			});
		}
	});
}
function replaceParams(config, config2){
	if(!config) {config = config2; return; }
	libObject.iterate2(config2, config, function(key, itConfig, itConfig2){
		itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!libObject.isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
		itConfig[key].forEach(function(v){
			itConfig2[key].push(v);
		});
	});
}
function mountJSON(config, dir){
	if(!dir) dir = ".";
	libObject.iterate(config, function(key, itConfig, i){
		var e;
		if(i==undefined)
			e = itConfig[key];
		else
			e = itConfig[key][i];
		if(e[0] == "@" && e[1] == "@"){
			var jpath = path.resolve(dir + "/" +e.substr(2));
			var json = libFile.readJSON(jpath);
			mountJSON(json, path.dirname(jpath));
			if(i==undefined)
				itConfig[key] = json;
			else
				itConfig[key][i] = json;
		}
	});
}
function intepretJSON(config){
	libObject.iterate(config, function(key, itConfig, i){
		var e;
		if(i==undefined)
			e = itConfig[key];
		else
			e = itConfig[key][i];
		
		if(e[0] == "#" && e[1] == "#"){
			var f = e.substr(2);
			globalConfig.sys.libPaths.forEach(function(lib){
				if(fs.existsSync(lib + "/" + f)){
					if(i == undefined){
						itConfig[key] = lib + "/" + f;
					}else{
						itConfig[key][i] = lib + "/" + f;
					}
				}
			});
		}
	});
}
function readNsDeps(ns, taskConfig){
	if(nsCache[ns]) return;
	nsCache[ns] = true;

  globalConfig.sys.nsPaths.forEach(function(nsPath){
		var nsSubPath = nsPath + "/" + ns;
		if(fs.existsSync(nsSubPath)){			
			var config = readConfig(nsSubPath);
			if(config.dep){
				libObject.each(config.dep, function(dep){
					readNsDeps(dep, taskConfig);
				});
			}
		}
	});
}
function readDeps(taskConfig){
	if(taskConfig.ns){
		taskConfig.ns.forEach(function(ns){
    	readNsDeps(ns, taskConfig);
		});
	}
	if(taskConfig.mod){
    for (var mod in taskConfig.mod){
			globalConfig.sys.modPaths.forEach(function(modPath){
        var modSubPath = modPath + "/" + mod;
        var parentConfig = readConfig(modSubPath, taskConfig.mod[mod]);
				for(var ns in nsCache){
					var modnsSubPath = modSubPath + "/" + ns;
					var config = readConfig(modnsSubPath, taskConfig.mod[mod]);
					if(config.loadPriority == 500)
						config.loadPriority = parentConfig.loadPriority + 0.1;
					if(config.srcPriority == 500)
						config.srcPriority = parentConfig.srcPriority + 0.1;
				};
      });
    }
  }
}
function readConfig(nsSubPath, modConfig){
	nsSubPath = path.resolve(nsSubPath);

	if(cache.hasOwnProperty(nsSubPath)) return null;
	var config = {};
  if(fs.existsSync(nsSubPath + "/config.json")){
    console.log(nsSubPath + "/config.json");
    config = libFile.readJSON(nsSubPath + "/config.json") || {};
  }
	if(modConfig){
		if(!config) config = {};
		for (var key in modConfig){
			config[key] = modConfig[key];
		}
	}
	if(!config.initPriority) config.initPriority = 10;
	if(!config.loadPriority) config.loadPriority = 500;
	if(!config.srcPriority) config.srcPriority = 500;
	cache[nsSubPath] = config;
	return config;
}

function readPriorities(taskConfig){
	for (var nsSubPath in cache){
		var config = cache[nsSubPath];
		if(!config) continue;
		if(fs.existsSync(nsSubPath + "/init.js"))
			taskConfig.load.push({
				priority: config.initPriority, 
				path: nsSubPath + "/init.js",
				config: config
			});

		if(fs.existsSync(nsSubPath + "/load.js"))
			taskConfig.load.push({
				priority: config.loadPriority, 
				path: nsSubPath + "/load.js",
				config: config
			});
		else if(fs.existsSync(nsSubPath + "/loader.js"))
			taskConfig.load.push({
				priority: config.loadPriority, 
				path: nsSubPath + "/loader.js",
				config: config
			});
		if(fs.existsSync(nsSubPath + "/src"))
			taskConfig.src.push({
				priority: config.srcPriority, 
				path: nsSubPath + "/src"
			});
	}
}


function loadSubPath(loadConfig, taskConfig){
	require(loadConfig.path)(taskConfig.env, loadConfig.config);
}


function fillDir(dir, tdir, dj, env){
	//		console.log("filldir " +dir);
	if(!dj.key && !dj.config){
		return; // need no speical mechanism
		process.exit(1);
	}

	var configs;
	// the array can be store in key and/or config
	if(dj.key){
		if(!env[dj.key]) configs = [];
		else if(!libObject.isArray(env[dj.key]))
			configs = [env[dj.key]];
		else
			configs = env[dj.key];
	}
	else
		configs = [];
	if(dj.config)
		if(!libObject.isArray(dj.config))
			configs.push(dj.config);
	else
		dj.config.forEach(function(c){
			configs.push(c);
		});
	if(!configs.length){
		console.log("!!!"+dir + "/psid.json not works");
		return;
	}
	configs.forEach(function(config, configi){
		// files: copy hetero
		if(libObject.isArray(config.files)){
			libFile.mkdirpSync(tdir);
			if(config.parse)
				config.files.forEach(function(f){
					var t = tdir + "/" + path.basename(f);
					rtn.genFiles[path.relative(".", t)] = {src: path.resolve(f)};
					fs.writeFileSync(t, tmpl({key: f}, {global: env, dir: path.basename(tdir)}));
				});
			else
				config.files.forEach(function(f){
					var t = tdir + "/" + path.basename(f);
					if(f != t){
						rtn.genFiles[path.relative(".", t)] = {src: path.resolve(f)};
						libFile.copySync(f, t);
					}
				});				
		}
		// copy homo
		else{

			if(!config.tpl) config.tpl = dir + "/psid.tpl";
			else config.tpl = dir + "/" + config.tpl;
			if(!fs.existsSync(config.tpl)){
				console.error("no tpl file " + config.tpl);
				process.exit(1);
			}



			var subenvs;
			if(config.env){
				subenvs = config.env;
			}else if(config.envlink){
				subenvs = env[config.envlink];
			}else if(!subenvs){
				subenvs = {};
				subenvs[dir] = {};
			}
			if(!subenvs){
				console.log("!!!"+dir + "/psid.json config " + configi + " not works");
				return;
			}
			
			if(libObject.isArray(subenvs)){
				console.log("the config for psid should not be array");
				process.exit(1);
			}

			
			for (var subkey in subenvs){
				var subenv = subenvs[subkey];

				//select subenv that matchs select
				var doloop = true;
				if(config.select){
					for(var key in config.select){
						if(config.select[key]){
							if(subenv[key] != config.select[key])
								doloop = false;
						}else{
							if(subenv[key])
								doloop = false;
						}
					}
				}
				if(!doloop) continue;

				subenv.global = env;
				if(!subenv.name) subenv.name = subkey;
				if(config.filename){
					var filename = tmpl({str: config.filename}, subenv);
					var t = tdir + "/" + filename;
					rtn.genFiles[path.relative(".", t)] = {tpl: path.resolve(config.tpl)};
					libFile.mkdirpSync(path.dirname(t));
					fs.writeFileSync(t, tmpl({key: config.tpl}, subenv));
				}else if(config.envname){
					if(!rtn.envs[config.envname]) rtn.envs[config.envname] = {};
					rtn.envs[config.envname][subenv.name] = {tpl: path.resolve(config.tpl)};
					if(!env[config.envname]) env[config.envname] = {};
					env[config.envname][subenv.name] = tmpl({key: config.tpl}, subenv);

				}
			};
			
		}
		/*else{
		 console.error("unknown config for disp.json", JSON.stringify(config, undefined, 2));
		 process.exit(1);
		 }
		 */
	});
	
}
function walk(dir, tdir, env){
	if(!fs.existsSync(dir)){
		console.log(dir + " is not exist");
		return 0;
	}

	if(!tdir)
		tdir = dir;

	var dj = {};
	if(fs.existsSync(dir+"/psid.json")){
		dj = libFile.readJSON(dir+"/psid.json");
		mountJSON(dj);
		intepretJSON(dj);
		if(dj.ignore){
//			if(fs.existsSync(tdir))
			return 0;
		}
		if(dj.mv)
			tdir = path.dirname(tdir) + "/" + tmpl({str: dj.mv}, {global: env});
		
		fillDir(dir, tdir, dj, env);

	}

	// then iterate file
	var files = fs.readdirSync(dir);
	files.forEach(function(f){
		if(f == "." || f.match(/~/) || f[0] == '#' 
			 || f.match(/^psid\./)
			 || f.match(/\.psid$/)
			 || fs.existsSync(dir + "/" + f +".disp") 
			 || fs.existsSync(dir + "/" + "disp." + f)
			 || fs.existsSync(dir + "/" + f +".disp2") 
			 || fs.existsSync(dir + "/" + "disp2." + f)
			){
			return 0;
		}
		var p = dir + '/' + f;
		if(isGenFile(p)){
			return 0;
		}
		var t;
		// support disp. in directory name
		var	stat = fs.statSync(p);
		if(stat.isDirectory()){
			walk(p, tdir + "/" + f, env);
			return 0;
		}
		// if begin with disp, format the file
		if(f.match(/^disp\./)){
			t = tdir + '/' + f.replace(/^disp./, "");
			rtn.genFiles[path.relative(".", t)] = {src: path.resolve(p)};
			libFile.mkdirpSync(path.dirname(t));
			fs.writeFileSync(t, tmpl({key: p}, {global: env}));
		}
		else if(f.match(/\.disp$/)){
			t = tdir + '/' + f.replace(/\.disp$/, "");
			rtn.genFiles[path.relative(".", t)] = {src: path.resolve(p)};
			libFile.mkdirpSync(path.dirname(t));
			fs.writeFileSync(t, tmpl({key: p}, {global: env}));
		}
		else if(f.match(/^disp2\./)){
			t = tdir + '/' + f.replace(/^disp2./, "");
			rtn.genFiles[path.relative(".", t)] = {src: path.resolve(p)};
			libFile.mkdirpSync(path.dirname(t));
			fs.writeFileSync(t, tmpl({key: p}, env));
		}
		else if(f.match(/\.disp2$/)){
			t = tdir + '/' + f.replace(/\.disp$/, "");
			rtn.genFiles[path.relative(".", t)] = {src: path.resolve(p)};
			libFile.mkdirpSync(path.dirname(t));
			fs.writeFileSync(t, tmpl({key: p}, env));
		}
		else if(dir != tdir){
			t = tdir + '/' + f;
			rtn.genFiles[path.relative(".", t)] = {src: path.resolve(p)};
			libFile.mkdirpSync(path.dirname(t));
			libFile.copySync(p, t);
		}else{
			var rp = path.relative(".", p);
			if(rp != ".result.json" && rp != ".project.json")
				rtn.rawFiles[rp] = {};
		}
	});
};


module.exports.methods = methods;
module.exports.intepretJSON = intepretJSON;
module.exports.set = set;
module.exports.run = run;
module.exports.tmpl = tmpl;
