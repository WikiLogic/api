/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var express = require("express"); // call express
var bodyParser = require("body-parser");
var port = process.env.PORT || 3030;
var morgan = require("morgan");
var passport = require("passport"); // authentication!

var app = express(); // define our app using express

process.on("uncaughtException", err => {
  console.error("whoops! there was an error", err);
});

var jwtService = require("./src/authentication/jwtService.js");

passport.use(jwtService.passportStrategy);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(morgan('combined'));

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  //all responces will default to json
  res.header("Content-Type", "application/json");
  //if there's an error, give it in the JSON - spewing an http error in a JSON feed is like water coming out an ethernet port. BLEARGH!
  res.status(200);

  next();
});

//Trust the proxy!
app.set("trust proxy", function(ip) {
  return true;
  //   if (ip === '127.0.0.1') {
  //     return true; // trusted IPs
  //   } else {
  //     return false;
  //   }
});

//================================= API Routes

var rootRouter = express.Router();
var adminRouter = require("./src/routes/admin/_index.js");
var userRouter = require("./src/routes/users/_index.js");
var claimRouter = require("./src/routes/claims/_index.js");
var argumentRouter = require("./src/routes/arguments/_index.js");

//--reading - turn this into a JSON object with docs, eg schemas & routes & versions
rootRouter.get("/", function(req, res) {
  res.send(`
    WL API<br />
    <a href="/api/v1/admin/test">/api/v1/admin/test</a>
  `);
});

app.use("/api/v1/", rootRouter);

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/claims", claimRouter);
app.use("/api/v1/arguments", claimRouter);

//list the versions and their routes?
app.get("/", function(req, res) {
  res.send('<a href="/api/v1/">/api/v1/</a>');
});

//================================= Begin
app.listen(port);
