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

process.on('uncaughtException', (err) => {
  console.error('whoops! there was an error', err);
});

var jwtService = require('./src/authentication/jwtService.js');

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


//================================= API Routes

var apiRouter = express.Router();
var routes = require('./src/routes/_index.js');

    //--reading - turn this into a JSON object with docs, eg schemas & routes
    apiRouter.get('/', function(req, res){
        res.send('WL API');
    });

    //--development
    apiRouter.get('/setup', routes.admin.setup);
    apiRouter.get('/test', routes.admin.status);

    apiRouter.post('/user/login', routes.users.login);
    apiRouter.post('/user/signup', routes.users.signup);
    apiRouter.delete('/user', passport.authenticate('jwt', { session: false }), routes.users.remove);
    apiRouter.get('/user', passport.authenticate('jwt', { session: false }), routes.users.profile);
    
    apiRouter.get('/claims', routes.claims.get);
    apiRouter.get('/claims/search', routes.claims.search);
    apiRouter.get('/claims/:_key', routes.claims.getById);
    apiRouter.post('/claims', passport.authenticate('jwt', { session: false }), routes.claims.create);
    apiRouter.delete('/claims', passport.authenticate('jwt', { session: false }), routes.claims.remove);

    apiRouter.post('/arguments', passport.authenticate('jwt', { session: false }), routes.arguments.create);
    apiRouter.delete('/arguments', passport.authenticate('jwt', { session: false }), routes.arguments.remove);
    
app.use('/api/v1/', apiRouter);

//list the versions and their routes?
app.get('/', function (req, res) {
  res.send('API rooter tooter super scooter');
});

//================================= Begin
app.listen(port);
