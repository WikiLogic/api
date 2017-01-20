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

apiRouter.get('/all', function(req, res){
    //for front end development: just returns a bunch of nodes & links
    try {
        
        db.cypher({
            query: 'MATCH (node), ()-[link]->() RETURN node, link LIMIT 100'
        }, function (err, results) {
            if (err) throw err;
            
            if (!results) {
                console.log('No claims found.');
                res.json({
                    error: 'No claims found'
                });
            } else {
                res.json({
                    data: results
                });
            }
        });

    }
    catch(err){
        res.json({
            error: 'Server error' + err
        });
    }
});

apiRouter.get('/claims', function(req, res){
    if (req.query.hasOwnProperty('search')){
        getClaims.bySearchTerm(req, res);
    }
});

apiRouter.get('/claims/:claimid', function(req, res){
    getClaims.byId(req, res);
});

app.use('/', apiRouter);



//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);