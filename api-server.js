/* This is the entry point for all web requests
 * This will deal with handling the distrobution of requests to the static file server or api
 */

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var path       = require('path');
var bodyParser = require('body-parser');
var port       = process.env.PORT || 3030;
var morgan     = require('morgan');

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
    console.log('ip', ip);
  if (ip === '127.0.0.1') {
    return true; // trusted IPs
  } else {
    return false;
  } 
})


var neo = require('./neo4j/neo-connection.js');


var getClaims = require('./read/_index.js');
var getArgs = require('./read/_index.js');
var create = require('./write/_index.js');


//================================= Routes

var apiRouter = express.Router();

//--reading
apiRouter.get('/', function(req, res){
    res.send('WL API');
});
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
apiRouter.get('/args/:claimid', function (req, res) {
    getArgs.byClaimId(req, res);
});

//--writing
apiRouter.post('/create/claim', function(req, res, next){
    console.log("TODO: check authentication");
    next();
}, function(req, res){
    create.claim(req, res);
});

apiRouter.post('/create/argument', function(req, res, next){
    console.log("TODO: check authentication");
    next();
}, function(req, res){
    create.argument(req, res);
});

apiRouter.post('/create/explanation', function (req, res, next) {
    console.log("TODO: check authentication");
    next();
}, function (req, res) {
    create.explanation(req, res);
});

//--development
apiRouter.get('/test', function(req, res){
    console.log('test route');
    neo.db.cypher({
        query: "CALL dbms.procedures()"
    }, function (err, results) {
        res.json({err:err,results:results});
    });
});

app.use('/api', apiRouter);

app.get('/', function (req, res) {
  res.send('API rooter tooter');
})


//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);