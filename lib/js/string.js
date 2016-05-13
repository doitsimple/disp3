module.exports.formatTwoDigit = formatTwoDigit;
function formatTwoDigit(num) {
	if (num < 10)
		return "0" + num.toString();
	else
		return num.toString();
}
module.exports.datestamp = function(date){
	if(!date || date == "Invalid Date") date = new Date();
	var str = "";
	str += date.getFullYear().toString();
	str += formatTwoDigit(date.getMonth() + 1);
	str += formatTwoDigit(date.getDate());
	return str;
}
module.exports.hat = function hat(bits, base) {
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

module.exports.makeArgvHelp = function(json){
	var str = "\nParams\n";
	for(var key in json){
		str += "-"+key+"\t"+json[key]+"\n";
	}
	return str;
}
module.exports.toFixed = function(str, num){
	if(!num) num  =2;
	return parseFloat( parseFloat(str).toFixed(num) );
}
function ucfirst(str) 
// convert the first character to uppercase
// discuss at: http://phpjs.org/functions/lcfirst/
// original by: Brett Zamir (http://brett-zamir.me)
{
	str += '';
	var f = str.charAt(0)
				.toUpperCase();
	return f + str.substr(1);
}
function strlen(str){
	var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}
function escapeRegex(str){
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
function quote(str){
	return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}
function maskUtilLast(str, num){
  return str.substr(0, str.length-num).replace(/./g, "*") +
        str.substr(str.length-num, num);
}
module.exports.escapeRegex = escapeRegex;
module.exports.ucfirst = ucfirst;
module.exports.strlen = strlen;
module.exports.quote = quote;
module.exports.maskUtilLast = maskUtilLast;

function compareVersion(v1, v2){
	var v1s = v1.split(".");
	var v2s = v2.split(".");
	var length = v1s.length>v2s.length?v1s.length:v2s.length;
	for(var i=0; i<v2s.length; i++){
		if(v1s[i] == undefined) v1s[i] = 0;
		else v1s[i] = parseInt(v1s[i]);
		if(v2s[i] == undefined) v2s[i] = 0;
		else v2s[i] = parseInt(v2s[i]);
		if(v1s[i] > v2s[i]) return 1;
		if(v1s[i] < v2s[i]) return -1;
	}
	return 0;
}
module.exports.compareVersion = compareVersion;
function dash2uc(dashStr){
	if(!dashStr) return "";
	var ucStr = "";
	for(var i=0; i<dashStr.length; i++){
		var c = dashStr[i];
		if(c === '-'){
			ucStr += dashStr[i+1].toUpperCase();
			i++;
		}else{
			ucStr += c;
		}
	}
	return ucStr;
}
module.exports.dash2uc = dash2uc;
function uc2dash(ucStr){
	if(!ucStr) return "";
	var dashStr = "";
	for(var i=0; i<ucStr.length; i++){
		var c = ucStr[i];
		if(c >= "A" && c <= "Z"){
			dashStr += "-" + ucStr[i].toLowerCase();
		}else{
			dashStr += c;
		}
	}
	return dashStr;
}
module.exports.uc2dash = uc2dash;
