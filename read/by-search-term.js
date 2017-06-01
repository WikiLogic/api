"use strict";
var neo = require('../neo4j/neo-connection.js');

/* /claims/:claimid
 * returns 
 *  - an array of claims that match the search term
 */

module.exports = function(req, res){

    try {
        neo.db.cypher({
            query: `MATCH (claim)
                    WHERE claim.text CONTAINS "${req.query.search}" 
                    RETURN claim LIMIT 25`
        }, function (err, results) {
            if (err) {
                res.json({
                    meta: 'There was a server error, :/',
                    data: {}
                });
            }
            
            if (!results) {
                res.json({
                    error: 'No claims found'
                });
            } else {
                var claims = [];

                results.map(function(claim){
                    claims.push({
                        id: claim.claim._id,
                        labels: claim.claim.labels,
                        text: claim.claim.properties.text,
                        state: claim.claim.properties.state
                    });
                });
                
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
        console.log('error in search term', err);
        res.json({
            errors: JSON.stringify(err),
        });
    }
}