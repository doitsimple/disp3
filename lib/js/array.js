module.exports.indexOf = indexOf;
function indexOf(array, element){
	if(!array || !array.length) return -1;
	for(var i=0; i<array.length; i++)
		if(array[i] == element)
			return i;
	return -1;
}
module.exports.indexOf2 = indexOf2;
function indexOf2(array, element){
	if(!array || !array.length) return -1;
	for(var i=0; i<array.length; i++)
		if(JSON.stringify(array[i]) == JSON.stringify(element))
			return i;
	return -1;
}
module.exports.pushIfNotExists = pushIfNotExists;
function pushIfNotExists(array, element){
	if(indexOf2(array, element) == -1){
		array.push(element);
	}
}
