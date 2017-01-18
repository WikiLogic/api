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


var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:n@localhost:7474');



//================================= Routes
var apiRouter = express.Router();

apiRouter.get('/claim/:claim_id', function(req, res){
   //http://localhost:3030/claim/1
   
    try {

        db.cypher({
            query: 'MATCH (u:User {email: {email}}) RETURN u',
            params: {
                email: 'alice@example.com',
            },
        }, function (err, results) {
            if (err) throw err;
            var result = results[0];
            if (!result) {
                console.log('No user found.');
                res.json({
                    error: 'No claim found'
                });
            } else {
                var user = result['u'];
                console.log(JSON.stringify(user, null, 4));
                res.json({
                    claim: JSON.stringify(user, null, 4)
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