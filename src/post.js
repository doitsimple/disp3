var fs = require("fs");
var path = require("path");
var libString = require("../lib/js/string");
var libArray = require("../lib/js/array");
var libObject = require("../lib/js/object");
var libSync = require("../lib/js/sync");
var libFile = require("../lib/nodejs/file");
var log = require("./log");
var cp = require("child_process");
module.exports = {
	run: run
}
function run(){
	var self = this;
	if(!self.project.posts) return 0;
	libSync.eachSeries(self.project.posts, function(cmd, cb){
		cp.exec(cmd, {
			cwd: self.project.target
		}, cb);
	}, function(){
		log.i("async finished");
	});
	return 0;
}
