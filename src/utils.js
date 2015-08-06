var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
module.exports.extend = extend;
function extend(config, config2){
	if(!config) {config = config2; return; }
	libObject.iterate2(config2, config, function(key, itConfig, itConfig2){
		itConfig2[key] = itConfig[key];
	}, function(key, itConfig, itConfig2){
		if(!libObject.isArray(itConfig2[key])){
			itConfig2[key]= [];
		}
//		itConfig2[key] = itConfig[key];
		itConfig[key].forEach(function(v){
			libArray.pushIfNotExists(itConfig2[key], v);
		});
	});
}
