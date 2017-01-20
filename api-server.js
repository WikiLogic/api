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
    /* Might have two identically worded claims with different meanings attached to words, so can't use them as urls / ids
     * Will have to use db id. Hopefully neo can just keep on incrementing. But the last version had something like a 3.5B limit. :D
     * 
     * /claims?search=...
     */
    console.log('claim search', JSON.stringify(req.query));
    if (req.query.hasOwnProperty('search')){
        try {

            db.cypher({
                query: `MATCH (argument)-[link]->(claim:Claim) WHERE claim.body CONTAINS "${req.query.search}" RETURN claim, link, argument LIMIT 100`
            }, function (err, results) {
                if (err) throw err;
                
                if (!results) {
                    console.log('No claims found.');
                    res.json({
                        error: 'No claims found'
                    });
                } else {
                    var nodes = [];
                    var links = [];

                    if (results.length > 0){
                        results.map(function(match) {
                            console.log('match: ', match);

                            nodes.push({
                                id: match.claim._id,
                                type: 'claim',
                                body: match.claim.properties.body,
                                state: match.claim.properties.state,
                            });

                            links.push({
                                id: match.link._id,
                                source: match.link._fromId,
                                target: match.link._toId,
                                type: match.link.type
                            });

                            nodes.push({
                                id: match.argument._id,
                                type: 'argument',
                                state: match.argument.properties.state,
                            });
                        })
                    }


                    res.json({
                        meta: 'aint no meta here yet',
                        data: {
                            nodes: nodes,
                            links: links
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
    }
});



app.use('/', apiRouter);



//================================= Begin
app.listen(port);

console.log('http://localhost:' + port);