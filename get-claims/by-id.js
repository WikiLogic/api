"use strict";
var db = require('../neo4j/neo-connection.js');

/* /claims/:claimid
 * returns:
 * 
 *  - the claim who's ID has been passed
 *  - the arguments that link to it
 *  - the claims that make up those arguments 
 */

module.exports = function(req, res){

                    //this would return USED_IN links and thir argument nodes - but not the other claims that make up uthose argument groups
    try {
        db.cypher({
            query: `match (callingClaim:Claim)<-[:UsedFor]-(c:ArgGroup)<-[:UsedIn]-(n:Claim)
                    WHERE ID(callingClaim) = ${req.params.claimid} 
                    with c, collect({ id: id(n), body: n.body, type: labels(n)[0] }) as claims
                    with { id: id(c), type: labels(c)[0], SubClaims: claims } as argument
                    return {claims: collect(argument) }
                    LIMIT 100`
        }, function (err, results) {
            if (err) throw err;
            
            if (!results) {
                console.log('No claims found.');
                res.json({ error: 'No claims found' });
            } else {
                if (results.length == 0){
                    
                    res.json({
                        meta: 'No claims match ' + req.params.claimid,
                        data: {}
                    });  
                    return;  
                } 

                if (results.length > 1){
                    //should only return one claim when getting by id... something's wrong with the data (scream!)

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