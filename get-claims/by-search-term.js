"use strict";
var db = require('../neo4j/neo-connection.js');

/* /claims/:claimid
 * returns 
 *  - an array of claims that match the search term
 */

module.exports = function(req, res){

    try {
        db.cypher({
            query: `MATCH (claim:Claim)
                    WHERE claim.text CONTAINS "${req.query.search}" 
                    WITH claim 
                    MATCH (axiom:Axiom)
                    WHERE axiom.text CONTAINS "${req.query.search}" 
                    RETURN axiom AS axioms, claim AS claims LIMIT 25`
        }, function (err, results) {
            if (err) throw err;
            
            if (!results) {
                res.json({
                    error: 'No claims found'
                });
            } else {
                console.log("results: ", results);
                var claims = [];

                if (results.length > 0){
                    results.map(function(match) {
                        claims.push({
                            id: match.claim._id,
                            type: 'claim',
                            text: match.claim.properties.text,
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