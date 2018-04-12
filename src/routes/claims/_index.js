var express = require("express");
var passport = require("passport");

var createRoute = require("./create.js");
var removeRoute = require("./remove.js");
var getByIdRoute = require("./getById.js");
var getter = require("./get.js");

var claimRouter = express.Router();

var authErrorHandler = function(err, req, res, next) {
  console.log("claims route not authed");
  res.json({
    errors: [{ title: "You are not logged in" }]
  });
};

/**
 * A plain get will return a list of recent claims
 */
claimRouter.get("/", async (req, res, next) => {
  try {
    var recentClaims = await getter.get();
    res.json({
      data: { results: recentClaims }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * A get request to the search route.
 * TODO: return recent if there's no s in the query? Replace the plain get?
 */
claimRouter.get("/search", async (req, res, next) => {
  if (!req.query.hasOwnProperty("s") || req.query.s == "") {
    res.json({ errors: [{ title: "search term is required" }] });
    return;
  }

  var searchTerm = req.query.s;

  try {
    var searchResults = await getter.search(searchTerm);
    res.json({
      data: { results: searchResults }
    });
  } catch (err) {
    next(err);
  }
});

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
