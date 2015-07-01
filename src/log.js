module.exports.e = e;
module.exports.i = i;
module.exports.v = v;
module.exports.setLevel = setLevel;
var level = 3;
function setLevel(_level){
	level = _level;
}
function e(str){
	if(level >= 1){
		console.error(str);
		console.trace();
	}
}
function i(str){
	if(level >= 2)
		console.log(str);
}
function v(str){
	if(level >= 3)
		console.log(str);
}
