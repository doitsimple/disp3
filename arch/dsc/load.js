
module.exports = function(config){
	var paths = [];
	for(var name in config.impl.databases){
		var database = config.impl.databases[name];
		database.type;
	}
}
