
function shiftLeft(str, len){
	return str.substr(len) + str.substr(0, len);
}

module.exports.encode = encode;
var alphabet = "0216894375",
      alphabetLength = alphabet.length;
function encode(input, len){
//	var alphabet2 = alphabet;
	input = parseInt(input);
	var alphabet2 = shiftLeft(alphabet, input % alphabet.length);
	var hash = "";
	do {
		hash += alphabet2[(input + len) % alphabetLength];
		input = parseInt(input/alphabetLength);
		len --;
	} while(len);
//	console.log(hash);
	return hash;
}
function decode(hash, last){
	var limit;
	if(!last){
		last = (alphabet.indexOf(hash[hash.length-1]) + alphabetLength - 1) % alphabetLength;
		limit = hash.length - 1;
	}else{
		limit = hash.length;
	}
	var alphabet2 = shiftLeft(alphabet, last);
	var input = 0, exp =1, len = hash.length, mod = 0;
	for(var i=0; i<limit; i++){
		input += ((alphabet2.indexOf(hash[i]) + alphabetLength - len) % alphabetLength) * exp;
		len --;
		mod += exp;
		exp*=alphabetLength;
	}
	if(last == input%10) return input;
	else {
//		console.log(last);
		return null;
		//decode(hash, (last + 10 -1 )%10);
	}
}
/*

var json = {};
for(var i =0;i<100; i++){
	var x = parseInt(encode(i, 2));
	if(!json[x]) json[x] = [];
	json[x].push(i);
}
console.log(json);


console.log("x: " + decode(encode("18", 8)));
console.log("x: " + decode(encode("19", 8)));
console.log("x: " + decode(encode("123", 8)));
console.log("x: " + decode(encode("1234", 8)));
console.log("x: " + decode(encode("12345", 8)));
console.log("x: " + decode(encode("123456", 8)));
console.log("x: " + decode(encode("1234567", 8)));

console.log("x: " + decode(encode("99999999", 8)));
console.log("x: " + decode(encode("44444444", 8)));
console.log("x: " + decode(encode("12345678", 8)));
console.log("x: " + decode(encode("12345671", 8)));
console.log("x: " + decode(encode("12345672", 8)));
console.log("x: " + decode(encode("12345673", 8)));
console.log("x: " + encode("0", 8));
console.log("x: " + encode("55555555", 8));
*/
