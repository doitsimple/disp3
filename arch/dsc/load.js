var path = require("path");
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
	for(name in config.impl.databases){
		var database = config.impl.databases[name];
		libObject.getDeps(database.type, deps, function(dep){
			libArray.pushIfNotExists(paths, archSrcDir + "/database/" + dep);
		});
	}
	for(name in config.impl.clients){
		var client = config.impl.clients[name];
		libObject.getDeps(client.type, deps, function(dep){
			libArray.pushIfNotExists(paths, archSrcDir + "/client/" + dep);
		});
	}
	for(name in config.impl.servers){
		var server = config.impl.servers[name];
		var serverRoot = archSrcDir + "/server/";
		libObject.getDeps(server.type, deps, function(sdep){
			libArray.pushIfNotExists(paths, serverRoot + sdep);
			server.withDatabases.forEach(function(sd){
				libObject.getDeps(config.impl.databases[sd].type, deps, function(dep){
					libArray.pushIfNotExists(paths, serverRoot + sdep + "-" + dep);
				});
			});
			server.withClients.forEach(function(sd){
				libObject.getDeps(config.impl.clients[sd].type, deps, function(dep){
					libArray.pushIfNotExists(paths, serverRoot + sdep + "-" + dep);
				});
			});
		});
	}
	return paths;
}
