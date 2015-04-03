var fs = require("fs");
var path = require("path");

function readJSON(file){
	if(fs.existsSync(file)){
		try{
			return JSON.parse(fs.readFileSync(file));
		}catch(e){
			console.error(file + " is not a valid JSON file");
			console.error(e.stack);
			return null;
		}
	}else{
		console.error(file + " not exist");
		return null;
	}
}
function readString(file){
	if(fs.existsSync(file)){
		try{
			return fs.readFileSync(file).toString();
		}catch(e){
			console.error(file + " is not a valid file");
			return "";
		}
	}else{
		console.error(file + " not exist");
		return "";
	}
}
function isExec(file){
	var stat = fs.statSync(file);
	return (stat.mode & parseInt('0001', 8));
}

//parse from npm install mkdirp
function mkdirp (p, opts, f, made) {
  if (typeof opts === 'function') {
    f = opts;
    opts = {};
  }
  else if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }
  
  var mode = opts.mode;
  var xfs = opts.fs || fs;
  
  if (mode === undefined) {
    mode = 0777 & (~process.umask());
  }
  if (!made) made = null;
  
  var cb = f || function () {};
  p = path.resolve(p);
  
  xfs.mkdir(p, mode, function (er) {
    if (!er) {
      made = made || p;
      return cb(null, made);
    }
    switch (er.code) {
    case 'ENOENT':
      mkdirp(path.dirname(p), opts, function (er, made) {
        if (er) cb(er, made);
        else mkdirp(p, opts, cb, made);
      });
      break;

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
    default:
      xfs.stat(p, function (er2, stat) {
        // if the stat fails, then that's super weird.
        // let the original error be the failure reason.
        if (er2 || !stat.isDirectory()) cb(er, made)
        else cb(null, made);
      });
      break;
    }
  });
}

function mkdirpSync (p, opts, made) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }
    
    var mode = opts.mode;
    var xfs = opts.fs || fs;
    
    if (mode === undefined) {
        mode = 0777 & (~process.umask());
    }
    if (!made) made = null;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = mkdirpSync(path.dirname(p), opts, made);
                mkdirpSync(p, opts, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = xfs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};


function copySync(srcFile, destFile){
	if(path.resolve(srcFile) == path.resolve(destFile))
		return;
	var BUF_LENGTH = 64*1024;
  var buff = new Buffer(BUF_LENGTH);
  var fdr = fs.openSync(srcFile, 'r');
  var fdw;
	if(isExec(srcFile))
		fdw = fs.openSync(destFile, 'w', "775");
	else	
		fdw = fs.openSync(destFile, 'w');

  var bytesRead = 1;
  var pos = 0;
  while(bytesRead > 0){
    bytesRead = fs.readSync(fdr, buff, 0, BUF_LENGTH, pos);
    fs.writeSync(fdw,buff,0,bytesRead);
    pos += bytesRead;
	}
  fs.closeSync(fdr);
  fs.closeSync(fdw);
}
function moveSync(srcFile, destFile){
	copySync(srcFile, destFile);
	fs.unlinkSync(srcFile);
}
function readdirNotFile(dir, fn){
	var list = [];
	fs.readdir(dir, function(err, listall) {
		listall.forEach(function(file) {
			var fpath = path.resolve(dir, file);
      var stat = fs.statSync(fpath);
      if (stat && stat.isDirectory()) {
				list.push(file);
			}
		});
		fn(null, list);
	});
}
/*
inspired form:
http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
*/
function readdirParallel(dir, results, done){
	if(!done){
		done = results;
		results = {};
	}
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
				if(err) return;
        if (stat && stat.isDirectory()) {
          readdirParallel(file, results, function(err) {
            if (!--pending) done(null, results);
          });
        } else {
					results[file] = {};
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

module.exports.isExec = isExec;
module.exports.readJSON = readJSON;
module.exports.readString = readString;
module.exports.mkdirp = mkdirp;
module.exports.mkdirpSync = mkdirpSync;
module.exports.copySync = copySync;
module.exports.cpSync = copySync;
module.exports.moveSync = moveSync;
module.exports.mvSync = moveSync;
module.exports.readdirNotFile = readdirNotFile;
module.exports.readdirParallel = readdirParallel;
function isSameFile(file1, file2){
	return fs.readFileSync(file1).toString() 
		== fs.readFileSync(file2).toString();
}
module.exports.isSameFile = isSameFile;
