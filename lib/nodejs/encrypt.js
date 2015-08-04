var bcrypt = require("bcrypt");
var crypto = require("crypto");
var ursa = require("ursa");


module.exports.md5 = function(data){
  var Buffer = require("buffer").Buffer;
  var buf = new Buffer(data);
  var str = buf.toString("binary");
  return crypto.createHash("md5").update(str).digest("hex");
}
module.exports.sha1 = function(data){
  var Buffer = require("buffer").Buffer;
  var buf = new Buffer(data);
  var str = buf.toString("binary");
  return crypto.createHash("sha1").update(str).digest("hex");
}
module.exports.rsa = function(str, key){
	return ursa.createPublicKey(key).encrypt(str, 'utf8', 'base64',ursa.RSA_PKCS1_PADDING);
}
/*
module.exports.rsa = function(str, key){
	var signer = crypto.createSign("RSA-SHA256");  
  signer.update(str);  
  var sign = signer.sign(key, "hex"); 
	console.log(sign);
	return Base64.encode(sign);
//	return ursa.createPublicKey(key).encrypt(str, 'utf8', 'base64');
}
*/
module.exports.bcrypt = function(str, saltnum){
	if(!saltnum) saltnum = 5;
	var salt = bcrypt.genSaltSync(saltnum);
	return hash = bcrypt.hashSync(str, salt);
}
module.exports.bcryptcompare = function(p1, p2, fn){
	if(typeof fn != "function")
		return bcrypt.compareSync(p1, p2);
	bcrypt.compare(p1, p2, fn);
}
module.exports.base64 = function(str){
	return (new Buffer(str || '', 'utf8')).toString('base64');
};
module.exports.base64decode = function(str){
	return (new Buffer(str || '', 'utf8')).toString('base64');
};
;
