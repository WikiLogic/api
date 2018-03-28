var express = require("express");
var passport = require("passport");

var createRoute = require("./create.js");
var removeRoute = require("./remove.js");

var argumentRouter = express.Router();

var authErrorHandler = function(err, req, res, next) {
  res.json({
    errors: [{ title: "You are not logged in" }]
  });
};

argumentRouter.post(
  "/",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  createRoute,
  authErrorHandler
);
argumentRouter.delete(
  "/",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  removeRoute,
  authErrorHandler
);

module.exports = argumentRouter;
