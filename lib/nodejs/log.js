var fs = require("fs");
var object = require("./object");
var date = require("./date");
module.exports.error = module.exports.e = e;
module.exports.warn = module.exports.w = w;
module.exports.info = module.exports.i = i;
module.exports.verbose = module.exports.v = v;
module.exports.setLevel = setLevel;
module.exports.setOutfile = setOutfile;
function setLevel(_level){
  level = _level;
}
var outstream = process.stdout;
function setOutfile(filename){
  outstream = fs.createWriteStream(filename, {flags: 'a+'});
}
function writeDate(){
  outstream.write("["+date.getSimple(new Date())+"]");
}
function write(obj){
  if(typeof obj == "object")
    outstream.write(object.stringify(obj, undefined, 2));
  else
		if(obj)
			outstream.write(obj.toString());
}
function getStackTrace(){
  var obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack.toString().replace("[object Object]\n","");
};

var level = 3;
function e(str){
  if(level >= 0){
    writeDate();
    write("e:");
    write(str);
    write("\n");
    write(getStackTrace());
    write("\n");
  }
}
function w(str){
  if(level >= 1){
    writeDate();
    write("w:");
    write(str);
    write("\n");
    write(getStackTrace());
    write("\n");
  }
}
function i(str){
  if(level >= 2){
    writeDate();
    write("i:");
    write(str);
    write("\n");
  }
}
function v(str){
  if(level >= 3){
    writeDate();
    write("v:");
    write(str);
    write("\n");
  }
}


