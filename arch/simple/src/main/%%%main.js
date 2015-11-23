^^
for(var i in global.main){
	var step = global.main[i];
	for(var key in step){
		$.invoke(key, p, step[key]);
	}
}
$$
