// random generate string sequece
function hat(bits, base) {
  if (!base) base = 16;
  if (bits === undefined) bits = 128;
  if (bits <= 0) return '0';
  var digits = Math.log(Math.pow(2, bits)) / Math.log(base);
  for (var i = 2; digits === Infinity; i *= 2) {
    digits = Math.log(Math.pow(2, bits / i)) / Math.log(base) * i;
  }
  var rem = digits - Math.floor(digits);
  var res = '';
  for (var i = 0; i < Math.floor(digits); i++) {
    var x = Math.floor(Math.random() * base).toString(base);
    res = x + res;
  }
  if (rem) {
    var b = Math.pow(base, rem);
    var x = Math.floor(Math.random() * b).toString(base);
    res = x + res;
  }
  var parsed = parseInt(res, base);
  if (parsed !== Infinity && parsed >= Math.pow(2, bits)) {
    return hat(bits, base)
  }
  else return res;
}
function genNum(len){
  var str = "";
  for(var i=0; i<len; i++){
    str += Math.floor(Math.random()*10).toString();
  }
  return str;
}
/*
function genNumUnique(len, getMethod, key, fn){
	var json = {};
	json.key = genNum(len);
	getMethod(json, {}, function(err, result){
		if(err){ fn(err); return;}
		if(result){ 
			genNumUnique(len, getMethod, key, fn);
		}else{
			fn(null, json.key);
		}
	});
}
function genNumsUnique(len, count, getMethod, key, fn, array){
	if(!array) array = [];
	var cb = function(err, num){
    if(err){fn(err); return;}
    array.push(num);
    if(array.length < count){
      genNumUnique(len, getMethod, key, cb, array);
    }else{
			fn(null, array);
		}
  };
	genNumUnique(len, getMethod, key, cb);
}
*/

module.exports.hat = hat;
module.exports.genNum = genNum;
