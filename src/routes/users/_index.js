var express = require("express");
var passport = require("passport");

var loginRoute = require("./login.js");
var signupRoute = require("./signup.js");
var profileRoute = require("./profile.js");
var removeRoute = require("./remove.js");

var userRouter = express.Router();

var authErrorHandler = function(err, req, res, next) {
  res.json({
    errors: [{ title: "You are not logged in" }]
  });
};

userRouter.post("/signup", signupRoute);

userRouter.post("/login", loginRoute);

userRouter.delete(
  "/",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  removeRoute,
  authErrorHandler
);

userRouter.get(
  "/",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  profileRoute,
  authErrorHandler
);

module.exports = userRouter;
