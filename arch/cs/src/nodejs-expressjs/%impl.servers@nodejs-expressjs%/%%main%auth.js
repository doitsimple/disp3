
// Load required packages
var passport = require('passport');
var db= require("../core/db");
var BearerStrategy = require('passport-http-bearer').Strategy;
function check(token, done) {
  db.getModel("^^=userdb$$").select({
    token: token
  }, function (err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }
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
function check^^=authflag$$(token, done) {
  db.getModel("^^=userdb$$").select({
    token: token
  }, function (err, user) {
    if(err) return done(err); 
    if(!user) return done(null, false); 
		if(!user["^^=authflag$$"]) return done(null, false);
    return done(null, user, { scope: 'all' });
  });
}
passport.use("^^=authflag$$", new BearerStrategy(check^^=authflag$$));
midwares["^^=authflag$$"] = passport.authenticate("^^=authflag$$", { session: false });
^^}$$
module.exports.midwares = midwares;
