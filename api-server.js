/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var path       = require('path');
var bodyParser = require('body-parser');
var port       = process.env.PORT || 3030;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var db = require('./neo4j/neo-connection.js');

var getClaims = require('./get-claims/_index.js');

//================================= Routes

var apiRouter = express.Router();

//--reading
apiRouter.get('/claims', function(req, res){
    if (req.query.hasOwnProperty('search')){
        getClaims.bySearchTerm(req, res);
    }
});
apiRouter.get('/claims/random', function(req, res){
    getClaims.random(req, res);
});
apiRouter.get('/claims/:claimid', function(req, res){
    getClaims.byId(req, res);
});

//--writing
apiRouter.post('/create/claim', function(req, res, next){
    console.log("create claim - check authentication");
    next();
}, function(req, res){
    console.log("create claim");
    res.json({api: 'says hello!'});
});
apiRouter.post('/create/argument', function(req, res, next){
    console.log("create claim - check authentication");
    next();
}, function(req, res){
    console.log("create argument");
    res.json({api: 'says hello!'});
});

app.use('/', apiRouter);




//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);