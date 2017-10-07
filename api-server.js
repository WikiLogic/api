/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var _ = require("lodash");
var express = require('express'); // call express
var bodyParser = require('body-parser');
var port = process.env.PORT || 3030;
var morgan = require('morgan');
var passport = require("passport"); // authentication!

var app = express(); // define our app using express

var arango = require('./src/_arango/_db');
arango.init();

var jwtService = require('./src/authentication/jwtService.js');
var loginRoute = require('./src/authentication/login.js');
var signupRoute = require('./src/authentication/signup.js');

passport.use(jwtService.passportStrategy);
app.use(passport.initialize());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(morgan('combined'));

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


// var neo = require('./src/_neo/_db.js');

var Users = require('./src/users/controller.js');
var Claims = require('./src/claims/controller.js');
var Arguments = require('./src/arguments/controller.js');
var Health = require('./src/health/controller.js');
// var Explanations = require('./src/explanations/controller.js');


//================================= API Routes

var apiRouter = express.Router();

    apiRouter.post("/login", loginRoute.post);
    apiRouter.post("/signup", signupRoute.post);
    
    //--reading
    apiRouter.get('/', function(req, res){
        res.send('WL API');
    });

    //--development
    apiRouter.get('/test', Health.check);
    
    apiRouter.get('/user', passport.authenticate('jwt', { session: false }), function(req, res){
        res.set(200);
        res.json({
            data: {
                user: {
                    username: req.user.username,
                    email: req.user.email,
                    signUpDate: req.user.signUpDate
                }
            }
        });
    });
    apiRouter.delete("/user", passport.authenticate('jwt', { session: false }), function(req, res) {
        Users.deleteUser(req.user._key).then((meta) => {
            req.logout();
            res.set(200);
            res.json({message: 'User was deleted'});
        }).catch((err) => {
            res.set(500);
            res.json({errors: [{title:'There was a problem when deleting this user'}]});
        });
    });

    apiRouter.get('/claims/search', passport.authenticate('jwt', { session: false }), Claims.search);
    apiRouter.post('/claims', passport.authenticate('jwt', { session: false }), Claims.create);
    // apiRouter.get('/claims/random', passport.authenticate('jwt', { session: false }), Claims.getRandom);
    apiRouter.get('/claims/:_key', passport.authenticate('jwt', { session: false }), Claims.getById);
    apiRouter.delete('/claims', passport.authenticate('jwt', { session: false }), Claims.remove);

    apiRouter.post('/arguments', passport.authenticate('jwt', { session: false }), Arguments.create);
    apiRouter.delete('/arguments', passport.authenticate('jwt', { session: false }), Arguments.remove);
    



    apiRouter.get('/args/:_key', passport.authenticate('jwt', { session: false }), function (req, res) {
        Arguments.getByClaimId(req, res);
    });

    //--writing
    // apiRouter.post('/create/claim', passport.authenticate('jwt', { session: false }), function(req, res, next){
    //     next();
    // }, function(req, res){
    //     Claims.create(req, res);
    // });

    apiRouter.post('/create/argument', passport.authenticate('jwt', { session: false }), function(req, res, next){
        next();
    }, function(req, res){
        Arguments.create(req, res);
    });

    // apiRouter.post('/create/explanation', passport.authenticate('jwt', { session: false }), function (req, res, next) {
    //     next();
    // }, function (req, res) {
    //     Explanations.create(req, res);
    // });

    

app.use('/api/v1/', apiRouter);

app.get('/', function (req, res) {
  res.send('API rooter tooter super scooter');
});

//================================= Begin
app.listen(port);
