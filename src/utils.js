var libArray = require("../lib/js/array");
var libFile = require("../lib/nodejs/file");
var libObject = require("../lib/js/object");
var libSync = require("../lib/js/sync");
var libPrompt = require("../lib/nodejs/prompt");
var tmpl = require("./tmpl");
module.exports = {
	extend: extend,
	append: append,
	readGlobal: readGlobal,
	selectRoles: selectRoles,
	checkName: checkName
}
function checkName(f){
	if(f == "." || f.match(/~$/) || f[0] == '#' || f.match(/^disp/)){
		return 0;
	}
	return 1;
}
function mountJSON(config, dir){
	if(!dir) dir= ".";
	libObject.iterate(config, function(key, itConfig, i){
    var e;
    if(i==undefined)
      e = itConfig[key];
    else
      e = itConfig[key][i];

    if(e[0] == "@" && e[1] == "@"){
			var arr = e.substr(2).split("@");
      var jpath = path.resolve(dir + "/" +arr[0]);
      var json = libFile.readJSON(jpath);
			if(arr[1])
				json = libObject.getByKey(json, arr[1]);
      mountJSON(json, path.dirname(jpath));
      if(i==undefined)
        itConfig[key] = json;
      else
        itConfig[key][i] = json;
    }
  });
}
function mountString(config){
	libObject.iterate(config, function(key, itConfig, i){
    var e;
    if(i==undefined)
      e = itConfig[key];
    else
      e = itConfig[key][i];
		var setnew = 0;
		if(typeof e == "string" && e.match(/\^\^.+\$\$/)){
			e = tmpl.render(e, itConfig, true);
			setnew = 1;
		}
		if(key.match(/\^\^.+\$\$/)){
			var tmpkey = tmpl.render(key, itConfig, true);
			delete itConfig[key];
			if(i!=undefined && !itConfig[tmpkey]) itConfig[tmpkey] = [];
			key = tmpkey;
			setnew = 1;
		}
		if(setnew){
			if(i==undefined)
				itConfig[key] = e;
			else
				itConfig[key][i] = e;
		}
	});
}

function extend(config, config2){
	if(!config) {config = config2; return; }
	libObject.iterate2(config2, config, function(key, itConfig, itConfig2){
		itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!libObject.isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
//		itConfig2[key] = itConfig[key];
		itConfig[key].forEach(function(v, i){
			if(typeof v == "object" && typeof itConfig2[key][i] == "object"){
				extend(itConfig2[key][i], v);
			}else{
				itConfig2[key][i] = v;
			}
//			libArray.pushIfNotExists(itConfig2[key], v);
		});
	});
}
function append(config, config2){
	if(!config) {config = config2; return; }
	libObject.iterate2(config2, config, function(key, itConfig, itConfig2){
		if(!itConfig2.hasOwnProperty(key)) itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!libObject.isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
		if(!itConfig2[key].length){
			itConfig2[key] = itConfig[key];
		}
		else{
			itConfig[key].forEach(function(v){
				libArray.pushIfNotExists(itConfig2[key], v);
			});
		}
	});
}
function readGlobal(dir){
	return libFile.readJSON(dir + "/disp.global.json");
}
function selectRoles(env, fn){
	var roles = {};
	libSync.eachSeries(Object.keys(env.project.roles), function(key, cb){
		libPrompt.select(env.project.roles[key], function(role){
			roles[key] = role;
			cb();
		});
	}, function(){
		fn(roles);
	});
}


