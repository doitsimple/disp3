var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libFile = require("../lib/nodejs/file");
var sync = require("../lib/js/sync");
var utils =require("./utils");
var log = require("../lib/nodejs/log");

var itp = require("./itp");
var gen = require("./gen");

module.exports = Disp;
function Disp(config, fn){
	var self = this;
	self.config = config;
	var dead = false;
	var steps = [
		init,
		itp.itpSrc,
		gen.genFiles
	]
	sync.doEach3(steps, self, function(err, result){
		if(err) log.e(err);
		else log.i("done");
		return;
	});
}

function init(fn){
	var self = this;
	var config = self.config;
	//init global
	self.global = {};
	self.global.nodeBin = process.argv.shift();
	self.global.dispBin = process.argv.shift();
	self.global.argv = process.argv;
	var ParamsHelp = {
		"p": "project path, default '.'",
		"t": "target path, default '.', can be configured in disp.json",
		"v": "verbose mode"
	}
	var op = process.argv.shift();
	var projectDir;
	while(op){
		switch(op){
			case "-p":
			projectDir = path.resolve(process.argv.shift());
			break;
			case "-t":
			self.global.targetDir = path.resolve(process.argv.shift());
			break;
			case "-v":
			log.setLevel(3);
			log.v("verbose mode enabled");
			break;
			default:
			return fn(libString.makeArgvHelp(ParamsHelp));
		}
		op = process.argv.shift();
	}
	if(!projectDir) projectDir = path.resolve(".");
	self.global.projectDir = projectDir;
	self.global.dispDir = path.resolve(__dirname + "/..");
	self.global.dicDir = path.resolve(__dirname + "/../dic");

	//init previous file list
	if(fs.existsSync(self.global.projectDir + "/disp.filelist.json"))
		self.prevFilelist = libFile.readJSON(self.global.projectDir + "/disp.filelist.json");
	else
		self.prevFilelist = {};
	self.filelist = {};
	//init src
	if(!fs.existsSync(self.global.projectDir + "/disp.json"))
		return fn("no disp.json");
	self.src = libFile.readJSON2(self.global.projectDir + "/disp.json");
	log.v("init success");
	fn();
}
