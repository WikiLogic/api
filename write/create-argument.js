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
    if (!postData.hasOwnProperty('parent_claim')) {
        return false;
    }
    if (!postData.hasOwnProperty('type') || (postData.type != 'SUPPORTS' || postData.type != 'OPPOSES') ) {
        return false;
    }
    if (!postData.hasOwnProperty('premises') || postData.premises.length < 2) {
        return false;
    }
    return true;
}

module.exports = function(req, res){
    
    console.log("TODO: escape post data");

    if (!testPostData(req.body)) {
        return res.json({
            errors: 'malformed post data',
        });
    }

    var premisMatch = req.body.premises;
    premisMatch.toString();

    try {
        db.cypher({
            query: `MATCH (claim:Claim), (premis:Claim)
                    WHERE ID(claim) = ${req.body.parent_claim} AND ID(premis) IN [${premisMatch}]
                    RETURN claim premis`
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
                    data: results
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