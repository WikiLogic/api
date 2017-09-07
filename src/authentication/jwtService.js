var Users = require('../users/controller.js');
var bcrypt = require('bcryptjs');
// var passport = require("passport"); // authentication!
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  Users.getUserByKey(jwt_payload.id).then((userObject) => {
    if (userObject) {
      next(null, userObject);
    } else {
      next(null, false);
    }
  });
});

module.exports = {
    passportStrategy: strategy,
    jwtOptions: jwtOptions,
    jwtSign: jwt.sign
}