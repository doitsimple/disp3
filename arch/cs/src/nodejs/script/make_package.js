var fs = require("fs");
var dirs = fs.readdirSync("node_modules");
var packagejson = {dependencies: {}};
for(var i in dirs){
	if(dirs[i]!=".bin")
		packagejson.dependencies[dirs[i]] = "*";
}
fs.writeFileSync("package.json", JSON.stringify(packagejson, undefined, 2));
