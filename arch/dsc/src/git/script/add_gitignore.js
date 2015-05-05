var fs = require("fs");
var libFile = require("./lib/file");
var json = require("../.filelist.json");
var ig = __dirname + "/../.gitignore";
var igb= __dirname + "/../.gitignore_bac";
var path = require("path");

if(fs.existsSync(igb)){
	libFile.cpSync(igb, ig);
}else{
	libFile.cpSync(ig, igb);
}
for(var file in json){
  if(json[file].main || json[file].src)
    fs.appendFileSync(ig, path.relative(__dirname + "/..", file)+"\n");
}
