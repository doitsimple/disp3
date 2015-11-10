var fs = require("fs");
module.exports.hash2csv = function(filename, hash){
	var fp = fs.createWriteStream(filename);
	var rownames = {};
	for(var key1 in hash){		
		fp.write(","+key1);
		for(var key2 in hash[key1]){
			rownames[key2] = 1;
		}
	}
	fp.write("\n");
	for(var key2 in rownames){
		fp.write(key2);
		for(var key1 in hash){
			if(hash[key1][key2])
				fp.write(","+hash[key1][key2]);
			else
				fp.write(",0");
		}
		fp.write("\n");
	}
	fp.end();
}
