/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var _ = require("lodash");
var express = require('express'); // call express
var bodyParser = require('body-parser');
var port = process.env.PORT || 3030;
var morgan = require('morgan');

var passport = require("passport"); // authentication!
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");

var app = express(); // define our app using express

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var arango = require('./src/_arango/_db');
var arangoReady = false;

var users = [
  {
    id: 1,
    name: 'demo',
    password: 'demo'
  }
];

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = 'tasmanianDevil';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  // usually this would be a database call:
  var user = users[_.findIndex(users, {id: jwt_payload.id})];
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

passport.use(strategy);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('combined'));

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Trust the proxy!
app.set('trust proxy', function (ip) {
    return true;
//   if (ip === '127.0.0.1') {
//     return true; // trusted IPs
//   } else {
//     return false;
//   } 
});


var neo = require('./src/_neo/_db.js');

var Users = require('./src/users/controller.js');
var Claims = require('./src/claims/controller.js');
var Arguments = require('./src/arguments/controller.js');
var Explanations = require('./src/explanations/controller.js');


//================================= API Routes

var apiRouter = express.Router();
    apiRouter.post("/login", function(req, res) {
        if(req.body.name && req.body.password){
            var name = req.body.name;
            var password = req.body.password;
        }

        // usually this would be a database call:
        var user = users[_.findIndex(users, {name: name})];
        if(!user){
            res.status(401).json({message:"no such user found"});
        }

        if(user.password === req.body.password) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = {id: user.id};
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({ 
                data: {
                    token: token,
                    user: {
                        name: 'Mr Demo'
                    }
                }
            });
        } else {
            res.status(401).json({message:"passwords did not match"});
        }
    });

     apiRouter.post("/signup", function(req, res) {
        if(req.body.email && req.body.name && req.body.password){
            var email = req.body.email;
            var name = req.body.name;
            var password = req.body.password;
        }

        Users.createUser(email, name, password).then((newUser) => {
            var payload = {id: newUser.id};
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({ 
                data: {
                    token: token,
                    user: newUser
                }
            });
        }).catch((err) => {
            res.status(401).json({message:"sign up error " + err});
        });
    });
    
    //--reading
    apiRouter.get('/', function(req, res){
        res.send('WL API');
    });

    apiRouter.get('/user', passport.authenticate('jwt', { session: false }), function(req, res){
        console.log('----- USER');
        res.json({
            data: {
                user: {
                    name:'Mr Demo'
                }
            }
        });
    });

    apiRouter.get('/claims', passport.authenticate('jwt', { session: false }), function(req, res){
        if (req.query.hasOwnProperty('search')){
            getClaims.bySearchTerm(req, res);
            Claims.search(req, res);
        }
    });
    apiRouter.get('/claims/random', passport.authenticate('jwt', { session: false }), function(req, res){
        Claims.getRandom(req, res);
    });
    apiRouter.get('/claims/:claimid', passport.authenticate('jwt', { session: false }), function(req, res){
        Claims.getById(req, res);
    });
    apiRouter.get('/args/:claimid', passport.authenticate('jwt', { session: false }), function (req, res) {
        Arguments.getByClaimId(req, res);
    });

    //--writing
    apiRouter.post('/create/claim', passport.authenticate('jwt', { session: false }), function(req, res, next){
        console.log("TODO: check authentication");
        next();
    }, function(req, res){
        Claims.create(req, res);
    });

    apiRouter.post('/create/argument', passport.authenticate('jwt', { session: false }), function(req, res, next){
        console.log("TODO: check authentication");
        next();
    }, function(req, res){
        Arguments.create(req, res);
    });

    apiRouter.post('/create/explanation', passport.authenticate('jwt', { session: false }), function (req, res, next) {
        console.log("TODO: check authentication");
        next();
    }, function (req, res) {
        Explanations.create(req, res);
    });

    //--development
    apiRouter.get('/test', function(req, res){
        if (!arangoReady) {
            arango.init()
            .then((connected) => { 
                arangoReady = true;
                console.log("DB UP!", connected); 
            }).catch((err) => { 
                console.log("DB init failed: ", err); 
            });
        }

        console.log('test');

        neo.db.cypher({
            query: "MATCH (n) RETURN count(*)"
        }, function (err, results) {
            res.json({err:err,results:results});
        });
    });

app.use('/api/', apiRouter);

app.get('/', function (req, res) {
  res.send('API rooter tooter super scooter');
});

//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);