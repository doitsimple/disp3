var path = require("path");
var fs = require("fs");
var log = "../../src/log";
var libArray = require("../../lib/js/array");
var libObject = require("../../lib/js/object");
var deps = {
	"angularjs": ["html"],
	"expressjs": ["nodejs"],
	"purenodejs": ["nodejs"]
}
module.exports = function(config){
	var archSrcDir = config.env.archSrcDir;
	var paths = [];
	var name;
// database
	for(name in config.impl.databases){
		var database = config.impl.databases[name];
		if(!database.type){
			log.i("no type for database " + name);
			return 0;
		}

		libObject.getDeps(database.type, deps, function(dep){
			addPath(paths, archSrcDir + "/database/" + dep);
			if(database.mods && database.mods.length){
				database.mods.forEach(function(mod){
					addPath(paths, archSrcDir + "/database/" + dep + "-" + mod);
				});
			}
		});
	}
// clients
	for(name in config.impl.clients){
		var client = config.impl.clients[name];
		if(!client.type){
			log.i("no type for client " + name);
			return 0;
		}
		libObject.getDeps(client.type, deps, function(dep){
			addPath(paths, archSrcDir + "/client/" + dep);
			if(client.mods && client.mods.length){
				client.mods.forEach(function(mod){
					addPath(paths, archSrcDir + "/client/" + dep + "-" + mod);
				});
			}
		});
	}
// servers
	for(name in config.impl.servers){
		var server = config.impl.servers[name];
		if(!server.type){
			log.i("no type for server " + name);
			return 0;
		}

		var serverRoot = archSrcDir + "/server/";
		libObject.getDeps(server.type, deps, function(sdep){
			addPath(paths, serverRoot + sdep);

			server.withDatabases.forEach(function(sd){
				libObject.getDeps(config.impl.databases[sd].type, deps, function(dep){
					addPath(paths, serverRoot + sdep + "-" + dep);
				});
			});
			server.withClients.forEach(function(sd){
				libObject.getDeps(config.impl.clients[sd].type, deps, function(dep){
					addPath(paths, serverRoot + sdep + "-" + dep);
				});
			});
			if(server.mods && server.mods.length){
				server.mods.forEach(function(mod){
					addPath(paths, archSrcDir + "/server/" + sdep + "-" + mod);
					server.withDatabases.forEach(function(sd){
						libObject.getDeps(config.impl.databases[sd].type, deps, function(dep){
							addPath(paths, serverRoot + sdep + "-" + dep + "-" + mod);
						});
					});
					server.withClients.forEach(function(sd){
						libObject.getDeps(config.impl.clients[sd].type, deps, function(dep){
							addPath(paths, serverRoot + sdep + "-" + dep + "-" + mod);
						});
					});
				});
			}

		});
	}
	return paths;
}
function addPath(paths, path){
	if(fs.existsSync(path)){
		libArray.pushIfNotExists(paths, path);
	}
}
