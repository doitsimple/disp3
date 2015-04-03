module.exports.indexOf = indexOf;
function indexOf(array, element){
	for(var i=0; i<array.length; i++)
		if(array[i] == element)
			return i;
	return -1;
}
