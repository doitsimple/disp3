var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var log = require("../lib/nodejs/log");
var render = require("./tmpl").render;
var concept = require("./concept");
module.exports = {
	genFiles: genFiles
}
function getSrc(src, impls){
	var self = this;
	var str = "";
	for(var key in src){
		str += concept.eval.call(self, src[key], impls);
	}
	return str;
}
function gen(filelist, target, global){
	var self = this;
	for (var orifilename in filelist){
		var partConfig = filelist[orifilename];
		var filename = target + "/" + orifilename;
		libFile.mkdirpSync(path.dirname(filename)); // should have a more efficient way
/*todo sync*/
/**/
		var str = "";
		if(partConfig.src){
			str += getSrc.call(self, partConfig.src, partConfig.impls || self.global.impls);
		}
		if(fs.existsSync(filename))
			fs.unlinkSync(filename);
		fs.writeFileSync(filename, str, {mode: 0444});
	}
}
function genFiles(fn){
	var self = this;
	var fileList = self.filelist;
	var globalEnv = self.global;
	var	target = globalEnv.target;

	target = target || ".";
	if(!fs.existsSync(target))
		libFile.mkdirpSync(target);
	fs.writeFileSync(target + "/disp.global.json", JSON.stringify(self.global, undefined, 2));
	fs.writeFileSync(target + "/disp.filelist.json", JSON.stringify(self.filelist, undefined, 2));

/* generate file */
	gen.call(self, fileList, target, globalEnv);
	log.v("generate success");
	fn();
}
