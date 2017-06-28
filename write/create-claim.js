"use strict";
var neo = require('../neo4j/neo-connection.js');

/* /create/claim POST data
 * returns:
 * 
 *  - the claim that was just created (with no arguments, as it will not have nay yet)
 */

var returnObj = {
    "meta": "No meta yet",
    "data": {
        "id": "33",
        "text": "text text",
        "probability": "null",
        "arguments": []
    }
}

module.exports = function(req, res){
    console.log("TODO: escape post data");
    try {

        neo.db.cypher({
            query: `CREATE (newClaim:Claim {text:  "${req.body.text}", probability:0.5})
                    RETURN newClaim`
        }, function (err, results) {
            if (err) throw err;
            
            if (!results) {
                console.log('No claims found.');
                res.json({ error: 'No claims found' });
            } else {
                if (results.length == 0){
                    
                    res.json({
                        meta: 'Claim was not returned, probably means it wasn\'t created ',
                        data: {}
                    });  
                    return;  
                } 

                if (results.length > 1){
                    //should only return one claim when getting by id... something's wrong with the data (scream!)
                    console.log('many many many');
                }

                res.json({
                    meta: 'No meta yet',
                    data: results[0]
                });
            }
        });

    }
    catch(err){
        console.log('error happened - meep moop');
        res.json({
            errors: JSON.stringify(err),
        });
    }
}