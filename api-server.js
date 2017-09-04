/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var _ = require("lodash");
var express = require('express'); // call express
var bodyParser = require('body-parser');
var port = process.env.PORT || 3030;
var morgan = require('morgan');
var bcrypt = require('bcryptjs');
var passport = require("passport"); // authentication!
var jwt = require('jsonwebtoken');
var passportJWT = require("passport-jwt");

var app = express(); // define our app using express

var guestlist = require('./guestlist.js');

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var arango = require('./src/_arango/_db');

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
//   Users.getUserByUsername(username).then((data) => {
//             let user = data[0];
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
        let errors = [];

        if (!req.body.hasOwnProperty('username') || req.body.username == '') {
            errors.push({title:'Username is required'});
        }

        if (!req.body.hasOwnProperty('password') || req.body.password == '') {
            errors.push({title:'Password is required'});
        }

        if (errors.length > 0) {
            res.status(400);
            res.json({ errors: errors });
            return;
        }
        
        var username = req.body.username;
        var password = req.body.password;

        Users.getUserByUsername(username).then((data) => {
            let user = data[0];
            if (data.length == 0) {
                res.json({ 
                    errors: [
                        {
                            title: 'No user found',
                            detail: 'There are no users in the database with that username.'
                        }
                    ]
                });
            }

            if(bcrypt.compareSync(req.body.password, user.hash)) {
                // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
                var payload = {id: user._id};
                var token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.json({ 
                    data: {
                        token: token,
                        user: {
                            username: user.username
                        }
                    }
                });
            } else {
                res.status(401).json({message:"passwords did not match"});
            }

        }).catch((err) => {
            console.log("===== err", err);
            res.status(401).json({message:"err"});
        });

    });

     apiRouter.post("/signup", function(req, res) {
        let errors = [];

        if (!req.body.hasOwnProperty('username') || req.body.username == '') {
            errors.push({title:'Username is required'});
        }

        if (!req.body.hasOwnProperty('email') || req.body.email == '') {
            errors.push({title:'Email is required'});
        }

        if (!req.body.hasOwnProperty('password') || req.body.password == '') {
            errors.push({title:'Password is required'});
        }

        if (errors.length > 0) {
            res.status(400);
            res.json({ errors: errors });
            return;
        }

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        
        //check if email is in whitelist
        let pass = false;
        console.log('----- email', email);
        for (var p = 0; p < guestlist.people.length; p++){
            console.log("----- guestlist.people[p].email", guestlist.people[p].email);
            if (email == guestlist.people[p].email) {
                pass = true;
            }
        }

        if (!pass) {
            res.json({message: "We're not open to public sign ups yet,please contact us to sign up"});
            return;
        }

        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        Users.createUser(email, username, hash).then((newUser) => {
            var payload = {id: newUser.id};
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({ 
                data: {
                    token: token,
                    user: newUser
                }
            });
        }).catch((err) => {
            res.json({message:"sign up error " + err});
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
        let neoHealth = neo.getHealth();
        let arangoHealth = arango.getHealth();

        Promise.all([neoHealth, arangoHealth]).then(values => { 
            res.json({data: values});
        }).catch((err) => {
            console.log('-------- err', err);
            res.json({err: err});
        });
    });

app.use('/api/', apiRouter);

app.get('/', function (req, res) {
  res.send('API rooter tooter super scooter');
});

//================================= Begin
app.listen(port);
