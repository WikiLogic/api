"use strict";
var db = require('../neo4j/neo-connection.js');

/* /claims/:claimid
 * returns 
 *  - an array of claims that match the search term
 */

module.exports = function(req, res){

    try {
        db.cypher({
            query: `MATCH (claim:Claim) WHERE claim.body CONTAINS "${req.query.search}" RETURN claim LIMIT 25`
        }, function (err, results) {
            console.log("HI");
            if (err) throw err;
            console.log("PHEW");
            if (!results) {
                console.log('No claims found.');
                res.json({
                    error: 'No claims found'
                });
            } else {
                var claims = [];

                if (results.length > 0){
                    results.map(function(match) {
                        claims.push({
                            id: match.claim._id,
                            type: 'claim',
                            body: match.claim.properties.body,
                            state: match.claim.properties.state,
                        });
                    })
                }
                
                res.json({
                    meta: 'aint no meta here yet',
                    data: {
                        claims: claims
                    }
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