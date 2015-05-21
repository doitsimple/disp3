
module.exports.isAndroid = isAndroid;
function isAndroid(str){
	var reg = new RegExp(/android/i);
  return reg.test(str);
}
module.exports.isIPhone = isIPhone;
function isIPhone(str){
	var reg = new RegExp(/iphone/i);
  return reg.test(str);
}
module.exports.isIPod = isIPod;
function isIPod(str){
	var reg = new RegExp(/ipod/i);
  return reg.test(str);
}
module.exports.isIPad = isIPad;
function isIPad(str){
	var reg = new RegExp(/ipad/i);
  return reg.test(str);
}
module.exports.isIOS = isIOS;
function isIOS(str){
  return isIPhone(str) || isIPod(str) || isIPad(str);
}
