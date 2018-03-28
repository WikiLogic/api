var express = require("express");
var passport = require("passport");

var searchRoute = require("./search.js");
var createRoute = require("./create.js");
var removeRoute = require("./remove.js");
var getByIdRoute = require("./getById.js");
var getRoute = require("./get.js");

var claimRouter = express.Router();

var authErrorHandler = function(err, req, res, next) {
  console.log("claims route not authed");
  res.json({
    errors: [{ title: "You are not logged in" }]
  });
};

claimRouter.get("/", getRoute);

claimRouter.get("/search", searchRoute);

claimRouter.get("/:_key", getByIdRoute);

claimRouter.post(
  "/",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  createRoute,
  authErrorHandler
);

claimRouter.delete(
  "/",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  removeRoute,
  authErrorHandler
);

module.exports = claimRouter;
