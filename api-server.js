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

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:n@localhost:7474');



//================================= Routes
var apiRouter = express.Router();

apiRouter.get('/claim', function(req, res){
   //http://localhost:3030/claim

    try {

        db.cypher({
            query: 'MATCH (n) RETURN (n) LIMIT 100'
        }, function (err, results) {
            if (err) throw err;
            
            if (!results) {
                console.log('No claims found.');
                res.json({
                    error: 'No claims found'
                });
            } else {
                console.log(JSON.stringify(results, null, 4));
                res.json({
                    claims: results
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



app.use('/', apiRouter);



//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);