
// Load required packages
var passport = require('passport');
var db= require("../core/db");
var BearerStrategy = require('passport-http-bearer').Strategy;
passport.use("default", new BearerStrategy(
  function(token, done) {
		var User = db.getModel("^^=userdb$$");
    User.select({ token: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
			^^=rule$$
      return done(null, user, { scope: 'all' });
    });
  }
));
var midwares = {};
module.exports.midware = midwares["default"] = passport.authenticate('default', { session: false });
