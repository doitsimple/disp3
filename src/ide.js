var fs = require("fs");
var libFile = require("../lib/nodejs/file");
function listProject(dir, fn){
	var projects = [];
	libFile.readdirNotFile(dir, function(err, list){
		if(err) {fn(err); return;}
		list.forEach(function(subdir){
			if(!fs.existsSync(dir + "/" + subdir + "/project.json")){
				return;
			}
			projects.push({
				dir: subdir
			});
		});
		fn(null, projects);
	});
}
module.exports.listProject = listProject;
