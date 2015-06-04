var fs = require("fs");
var libFile = require("./lib/file");
var json = require("../.filelist.json");
var ig = __dirname + "/../.gitignore";
var igb= __dirname + "/../.gitignore_bac";
var path = require("path");
if(path.resolve(__dirname + "/..") != path.resolve(".")){
	console.log("must run in the folder contains project.json");
	process.exit(1);
}
if(fs.existsSync(igb)){
	libFile.cpSync(igb, ig);
}else{
	libFile.cpSync(ig, igb);
}
for(var file in json){
  if(json[file].main || json[file].src){
		var rf = path.relative(__dirname + "/..", file);
    fs.appendFileSync(ig, rf+"\n");
		fs.chmodSync(file, 0444);
	}
}