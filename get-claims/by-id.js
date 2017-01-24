"use strict";
var db = require('../neo4j/neo-connection.js');

/* /claims/:claimid
 * returns 
 *  - the claim who's ID has been passed
 *  - the arguments that link to it
 *  - the claims that make up those arguments 
 */

module.exports = function(req, res){

    try {
        db.cypher({
            query: `OPTIONAL MATCH p = ((subClaim:Claim)-[subLink]->(argument:ArgGroup)-[argLink]->(claim:Claim))
                    WHERE ID(claim) = ${req.params.claimid} 
                    RETURN  
                        {id: id(claim), body: claim.body, state: claim.state, type: "claim"} AS claim, 
                        COLLECT({id: ID(subClaim), body: subClaim.body, state: subClaim.state, type: "claim"}) AS subClaims, 
                        COLLECT({id: ID(argument), state: argument.state, type: "argument"}) as argument, 
                        COLLECT({id: ID(argLink), type: argLink.type, source: ID(startNode(argLink)), target: ID(endNode(argLink))}) as argLinks, 
                        COLLECT(argLink) as argLinksCheck,
                        COLLECT(subLink) as subLinks
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