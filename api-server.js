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
var db = new neo4j.GraphDatabase('http://neo4j:neo4j@localhost:7474');



//================================= Routes
var apiRouter = express.Router();

apiRouter.get('/all', function(req, res){
       //http://localhost:3030/claims

    try {
        
        db.cypher({
            query: 'MATCH (node:Claim)-[link]->(argument:Argument) RETURN node, link, argument LIMIT 100'
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

apiRouter.get('/claims/:claim', function(req, res){
    console.log('claim search', req.params.claim);
    try {

        db.cypher({
            query: `MATCH (claim:Claim) WHERE claim.body CONTAINS "${req.params.claim}" RETURN (claim) LIMIT 100`
        }, function (err, results) {
            if (err) throw err;
            
            if (!results) {
                console.log('No claims found.');
                res.json({
                    error: 'No claims found'
                });
            } else {
                var matches = [];
                if (results.length > 0){
                    results.map(function(match) {
                        matches.push({
                            body: match.claim.properties.body,
                            state: match.claim.properties.state,
                            id: match.claim._id
                        });
                    })
                }


                res.json({
                    meta: 'aint no meta here yet',
                    data: {
                        matches: matches
                    }
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