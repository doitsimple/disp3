module.exports.indexOf = indexOf;
function indexOf(array, element){
	if(!array || !array.length) return -1;
	for(var i=0; i<array.length; i++)
		if(array[i] == element)
			return i;
	return -1;
}
module.exports.pushIfNotExists = pushIfNotExists;
function pushIfNotExists(array, element){
	if(indexOf(array, element) == -1){
		array.push(element);
	}
}
