
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
