var fs = require("fs");
var dirs = fs.readdirSync("node_modules");
var packagejson = {dependencies: {}};
for(var i in dirs){
	if(dirs[i]!=".bin"){
		var json = JSON.parse(fs.readFileSync("./node_modules/"+ dirs[i] +"/package.json"));
		packagejson.dependencies[dirs[i]] = json.version;
	}
}
fs.writeFileSync("package.json", JSON.stringify(packagejson, undefined, 2));
