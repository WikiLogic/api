var express = require("express");
var passport = require("passport");

var ClaimModel = require("../../queries/claim-model");
var PremiseLinkModel = require("../../queries/premise-link-model.js");
var ArgumentModel = require("../../queries/argument-model.js");

var adminRouter = express.Router();

var authErrorHandler = function(err, req, res, next) {
  res.json({
    errors: [{ title: "You are not logged in" }]
  });
};

function status(req, res) {
  Promise.all([
    ClaimModel.status(),
    PremiseLinkModel.status(),
    ArgumentModel.status()
  ])
    .then(results => {
      res.json({
        data: results
      });
    })
    .catch(err => {
      console.log("Arango health check fail", err);
      res.json({
        errors: [{ title: "Arango health check failed", err: err }]
      });
    });
}

adminRouter.get("/test", status);
adminRouter.get("/hello", (req, res) => {
  res.json({
    message: "hello!"
  });
});

module.exports = adminRouter;
