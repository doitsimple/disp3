
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
midwares.checkflag = function(flag, content){
	if(!content) content = "权限不足";
	return function(req, res, next){
		if(req.user[flag]) return next(req, res);
		else res.send({error:content});
	};
}
module.exports.midwares = midwares;
