module.exports.group = function(tbl){
	var rtn = {};
	for(var i in tbl){
		for(var key in tbl[i]){
			var val = tbl[i][key];
			if(!rtn[key]) rtn[key] = 0;
			if(typeof val == "number"){
				rtn[key] += val;
			}else{
				rtn[key] += 1;
			}
		}
	}
	return rtn;
}
