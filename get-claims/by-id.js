"use strict";
var db = require('../neo4j/neo-connection.js');

/* /claims/:claimid
 * returns 
 *  - the claim who's ID has been passed
 *  - the arguments that link to it
 *  - the claims that make up those arguments 
 */

var exampleResponce = {
    claim: 'claim object',
    arguments: [ 'argument objects' ],
    claims: [ 'sub claim objects' ],
    links: [ 'link objects' ]

}

module.exports = function(req, res){

    try {
        db.cypher({
            query: `MATCH (claim:Claim)
                    WHERE ID(claim) = ${req.params.claimid} 
                    WITH claim
                    OPTIONAL MATCH argPath = (argument:Argument)-[focusLink]->(claim), subClaimPath = (subClaim:Claim)-[subLink]->(argument)
                    RETURN claim, focusLink, argument, subLink, subClaim, nodes(argPath), nodes(subClaimPath)
                    LIMIT 25`
        }, function (err, results) {
            if (err) throw err;
            
            if (!results) {
                console.log('No claims found.');
                res.json({ error: 'No claims found' });
            } else {

                //================ This is the happy path
                var claim = {};
                var argumentGroups = [];
                var claims = [];
                var links = [];
                console.log("happy path!",results);

                // if (results.length > 0){
                //     results.map(function(match) {
                        
                //         claims.push({
                //             id: match.claim._id,
                //             type: 'claim',
                //             body: match.claim.properties.body,
                //             state: match.claim.properties.state,
                //         });
                //     })
                // }

                res.json(results);
                // res.json({
                //     meta: 'aint no meta here yet',
                //     data: {
                //         claim: claims
                //     }
                // });
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