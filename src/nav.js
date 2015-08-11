var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
module.exports = {
	getNavPaths: getNavPaths
}

function getNavPaths(){
	var self = this;
	self.navpaths = {};
	var archs = Object.keys(self.archs).reverse();
	var project = self.global.project;
	for(var i in archs){
		var arch = archs[i];
		var archSrc = path.resolve(self.rootDir + "/arch/" + arch + "/src");
		var types = [];
		var mods = {};
		if(project.navspaces.length)
			for(var i in project.navspaces){
				var navspace = project.navspaces[i];
				var arr = libObject.getsByKey(self.global, navspace);
				for(var j in arr){
					var type = arr[j].type;
					if(!type) continue;
					libArray.pushIfNotExists(types, type);
					if(arr[j].mods) 
						for(var k in arr[j].mods){
							if(!mods[type]) mods[type] = [];
							mods[type].push(arr[j].mods[k]);
						}
				}
			}	
		for(var i in types){
			var type = types[i];
			addPath.call(self, archSrc + "/" + type);
			for(var j in mods[type]){
				var mod = mods[type][j];
				addPath.call(self, archSrc + "/" + type + "-" + mod);
			}
		}
		if(project.navpaths && project.navpaths.length)
			project.navpaths.forEach(function(navpath){
				addPath.call(self, navpath);
			});
	}
	if(fs.existsSync(self.projectDir + "/kits")){
		var dirlist = libFile.readdirNotFileSync(self.projectDir + "/kits");
		for(var i in dirlist){
			addPath.call(self, self.projectDir + "/kits/" + dirlist[i]);
		}
	}
	addPath.call(self, ".");
}
function addPath(p){
	var self = this;
  if(fs.existsSync(p)){
    self.navpaths[path.resolve(p)] = 1;
  }
}

