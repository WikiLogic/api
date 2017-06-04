"use strict";
var db = require('../neo4j/neo-connection.js');

/* /create/explanation POST data expects:
 *      parent_claim: ID
 *      type: "SUPPORTS" / "OPPOSES"
 *      premises: [ID, ID, ID] array minimum of 2?
 * 
 * returns:
 *  - 6107336639
 *  - The parent claim filled out with all it's explanations 
 */

var returnObj = {
    "meta": "No meta yet",
    "data": {
        "id": "33",
        "text": "text text",
        "probability": "null",
        "explanations": []
    }
}

function testPostData(postData) {
    if (!postData.hasOwnProperty('parent_claim_id')) {
        console.log("1", postData.parent_claim_id);
        return false;
    }
    if (!postData.hasOwnProperty('type') || (postData.type != 'SUPPORTS' && postData.type != 'OPPOSES')) {
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

module.exports = function (req, res) {

    console.log("TODO: escape post data", typeof req.body);

    if (!testPostData(req.body)) {
        return res.json({
            errors: 'malformed post data',
        });
    }

    var premisMatch = req.body.premise_ids;
    premisMatch.toString();

    try {
        //create an explanation node with a ${req.body.type} link to the ${req.body.parent_claim_id} claim node and multiple USED_IN links from the req.body.premise_ids claims
        //call WL.CreateexplanationGroup([1243, 1254])
        //call WL.AttachexplanationGroup(1243, 1254, "SUPPORTS")

        var newArgGroupID = 0;

        console.log("step by step:1");

        db.cypher({
            query: `call WL.CreateArgumentGroup([${premisMatch}])`
        }, function (err, results) {
            console.log("step by step:2");
            if (err) throw err;

            if (!results) {
                console.log('No claims found.');
                res.json({
                    error: 'No claims found'
                });
            } else {
                if (results.length == 0) {

                    res.json({
                        meta: 'Claim was not returned, probably means it wasn\'t created ',
                        data: {}
                    });
                    return;
                }
            }
        });

    } catch (err) {
        console.log('error happened - meep moop');
        res.json({
            errors: JSON.stringify(err),
        });
    }
}