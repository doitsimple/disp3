var libArray = require("./array");
module.exports.toDisplay = toDisplay;
function toDisplay(mat, title){
	if(!title) title = "";
	var rtn = {title: [title], data: []};
	var rownames = [];
	for(var key1 in mat){
		rtn.title.push(key1);
		for(var key2 in mat[key1]){
			libArray.pushIfNotExists(rownames, key2);
		}
	}

	for(var i in rownames){
		var key2 = rownames[i];
		var row = [key2];
		for(var key1 in mat){
			if(!mat[key1][key2]) mat[key1][key2] = 0;
			row.push(mat[key1][key2]);
		}
		rtn.data.push(row);
	}
	return rtn;
}
module.exports.validate = validate;
function validate(){
}

module.exports.fromTable = fromTable;
function fromTable(tbl, count, levels, fns){
	var mat = {};
	for(var i in tbl){
		var row = tbl[i];
		var submat = mat;
		for(var li in levels){
			var key;
			if(fns[li]) key = fns[li](row[levels[li]]);
			else key = row[levels[li]];
			if(li != levels.length-1){
				if(!submat[key]) submat[key] = {};
				submat = submat[key];
			}else{
				if(!submat[key]) submat[key] = 0;
				if(row[count])
					submat[key] += row[count];
			}
		}
	}
	return mat;
}
