
// Load required packages
var passport = require('passport');
var db= require("../db");
var BearerStrategy = require('passport-http-bearer').Strategy;
var log =require("../lib/log");
function check(token, done) {
  db.getModel("^^=userschema$$").select({
    token: token
  }, function (err, user) {
    if (err) { return done(err); }
    if (!user) { log.i(401); return done(null, false); }
    ^^=rule$$
    return done(null, user, { scope: 'all' });
  });
}
passport.use("default", new BearerStrategy(check));
module.exports.check = check;
var midwares = {};
midwares["default"] = passport.authenticate('default', { session: false });
module.exports.midware = midwares["default"];
^^for(var fi=0; fi<local.authflags.length;fi++){var authflag = authflags[fi];$$
midwares["^^=authflag$$"] = function(req, res, next){
	if(!req.user["^^=authflag$$"]) return next(req, res);
	else res.status(401).send("");
	
}
^^}$$
module.exports.midwares = midwares;
