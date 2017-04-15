"use strict";
var db = require('../neo4j/neo-connection.js');

/* /create/argument POST data expects:
 *      parent_claim: ID
 *      type: "SUPPORTS" / "OPPOSES"
 *      premises: [ID, ID, ID] array minimum of 2?
 * 
 * returns:
 *  - 6107336639
 *  - The parent claim filled out with all it's arguments 
 */

var returnObj = {
    "meta": "No meta yet",
    "data": {
        "id": "33",
        "text": "text text",
        "state": "null",
        "arguments": []
    }
}

function testPostData(postData){
    if (!postData.hasOwnProperty('parent_claim_id')) {
        console.log("1", postData.parent_claim_id);
        return false;
    }
    if (!postData.hasOwnProperty('type') || (postData.type != 'SUPPORTS' && postData.type != 'OPPOSES') ) {
        console.log("2", postData.type);
        return false;
    }
    if (!postData.hasOwnProperty('premise_ids') || postData.premise_ids.length < 2) {
        //premise_ids should be an array of claim IDs
        console.log("3", postData.premises);
        return false;
    }
    return true;
}

module.exports = function(req, res){
    
    console.log("TODO: escape post data", typeof req.body);

    if (!testPostData(req.body)) {
        return res.json({
            errors: 'malformed post data',
        });
    }

    var premisMatch = req.body.premise_ids;
    premisMatch.toString();

    try {
        //create an argument node with a ${req.body.type} link to the ${req.body.parent_claim_id} claim node and multiple USED_IN links from the req.body.premise_ids claims
        db.cypher({
            query: `MATCH (claim:Claim), (premis:Claim)
                    WHERE ID(claim) = ${req.body.parent_claim_id} AND ID(premis) IN [${premisMatch}]
                    WITH claim, COLLECT(premis) AS premises
                    CREATE (newArgument:ArgGroup)-[:${req.body.type}]->(claim)
                    WITH newArgument, premises, claim
                    FOREACH (premise IN premises | CREATE (premise)-[:USED_IN]->(newArgument))
                    WITH claim
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
                        meta: 'Claim was not returned, probably means it wasn\'t created ',
                        data: {}
                    });  
                    return;  
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