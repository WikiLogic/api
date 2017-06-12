"use strict";
var neo = require('../neo4j/neo-connection.js');

/* /claims/:claimid
 * returns:
 * 
 *  - the claim who's ID has been passed
 *  - the arguments that link to it
 *  - the claims that make up those arguments 
 */

var returnObj = {
    "meta": "No meta yet",
    "data": {
        "id": "33",
        "text": "text text",
        "probability": "null",
        "arguments": [
            {
                "type": "SUPPORTS",
                "probability": "50",
                "premises": [
                    {
                        "id": "34",
                        "text": "premis text",
                        "probability": "50"
                    }
                ]
            }
        ]
    }
}

// query: `MATCH (claim:Claim)
//                     WHERE ID(claim) = ${req.params.claimid} 
//                     OPTIONAL MATCH (subClaim:Claim)-[subLink]->(argument:ArgGroup)-[argLink]->(claim)
//                     OPTIONAL MATCH (claim)-[usedInLink]->(usedInArg)<-[usedInSiblingLink]-(usedInSibling)
//                     RETURN  
//                         CASE WHEN ID(usedInArg) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(usedInSibling), text: usedInSibling.text, state: usedInSibling.state, type: "claim"}) END AS usedInSiblings,
//                         CASE WHEN ID(usedInArg) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(usedInSiblingLink), type: "USED_IN", source: ID(startNode(usedInSiblingLink)), target: ID(endNode(usedInLink))}) END AS usedInSiblingLinks,
//                         CASE WHEN ID(usedInArg) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(usedInArg), state: usedInArg.state, type: "argument"}) END AS usedInArgs,
//                         CASE WHEN ID(usedInArg) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(usedInLink), type: "USED_IN", source: ID(startNode(usedInLink)), target: ID(endNode(usedInLink))}) END AS usedInLinks,
//                         {id: id(claim), text: claim.text, state: claim.state, type: "claim"} AS claim,
//                         CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(argLink), type: TYPE(argLink), source: ID(startNode(argLink)), target: ID(endNode(argLink))}) END AS argLinks, 
//                         CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(argument), state: argument.state, type: "argument"}) END AS arguments, 
//                         CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(subLink), type: TYPE(subLink), source: ID(startNode(subLink)), target: ID(endNode(subLink))}) END AS subLinks,
//                         CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(subClaim), text: subClaim.text, state: subClaim.state, type: "claim"}) END AS subClaims
//                     LIMIT 100`
module.exports = function(req, res){

                    //this would return USED_IN links and thir argument nodes - but not the other claims that make up uthose argument groups
                        //CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(subLink), type: TYPE(subLink), source: ID(startNode(subLink)), target: ID(endNode(subLink))}) END AS subLinks,
                        //CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(argLink), type: TYPE(argLink), source: ID(startNode(argLink)), target: ID(endNode(argLink))}) END AS argLinks, 
    try {

        neo.db.cypher({ //should be neo.db.cypher ??
            query: `call WL.GetClaimWithArgs(${req.params.claimid})`
        }, function (err, results) {
            if (err) {
                console.log('eer', err);
                res.json({
                    meta: 'There was a server error, :/',
                    data: {}
                });
                return;
            }
            
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
        console.log('error in by id', err);
        res.json({
            errors: JSON.stringify(err),
        });
    }
}