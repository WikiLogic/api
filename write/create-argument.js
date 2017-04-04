"use strict";
var db = require('../neo4j/neo-connection.js');

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
        "state": "null",
        "arguments": [
            {
                "type": "SUPPORTS",
                "state": "50",
                "premises": [
                    {
                        "id": "34",
                        "text": "premis text",
                        "state": "50"
                    }
                ]
            }
        ]
    }
}

module.exports = function(req, res){

                    //this would return USED_IN links and thir argument nodes - but not the other claims that make up uthose argument groups
                        //CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(subLink), type: TYPE(subLink), source: ID(startNode(subLink)), target: ID(endNode(subLink))}) END AS subLinks,
                        //CASE WHEN ID(argument) IS NULL THEN [] ELSE COLLECT(DISTINCT {id: ID(argLink), type: TYPE(argLink), source: ID(startNode(argLink)), target: ID(endNode(argLink))}) END AS argLinks, 
    try {
        db.cypher({
            query: `MATCH (claim)
                    WHERE (claim:Claim OR claim:Axiom) AND (ID(claim) = ${req.params.claimid})
                    OPTIONAL MATCH (argument:ArgGroup)-[argLink]->(claim)
                    OPTIONAL MATCH (premis:Claim)-[premisLink]->(argument)
                    WITH claim, argument, argLink, 
                        CASE WHEN ID(premis) IS NULL THEN null ELSE {id: ID(premis), text: premis.text, labels: LABELS(premis), state: premis.state} END AS premises
                    WITH claim, 
                        CASE WHEN ID(argument) IS NULL THEN null ELSE {id: ID(argument), type:TYPE(argLink), state: argument.state, premises: COLLECT(premises)} END AS arguments 
                    WITH {id: id(claim), text: claim.text, labels: LABELS(claim), state: claim.state, arguments: COLLECT(arguments)} AS claim
                    RETURN claim
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