"use strict";
var neo = require('../_neo/_db.js'); 

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
        "probability": "null",
        "arguments": []
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

    var premisMatch = String(req.body.premise_ids);
    var parentClaimId = String(req.body.parent_claim_id);
    var type = String(req.body.type);
    
    try {
        //create an argument node with a ${req.body.type} link to the ${req.body.parent_claim_id} claim node and multiple USED_IN links from the req.body.premise_ids claims

        //call WL.CreateArgumentGroup([1243, 1254])
        //call WL.AttachArgumentGroup(1243, 1254, "SUPPORTS")

        var newArgGroupID = 0;

        console.log("step by step:1");

        neo.db.cypher({
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
                
                newArgGroupID = results[0].value;
                console.log("newArgGroupID", newArgGroupID);
                console.log("parentClaimId", parentClaimId);
                console.log("type", type);

                neo.db.cypher({
                    query: `call WL.AttachArgumentGroup(${newArgGroupID}, ${parentClaimId}, "${type}")`
                }, function (err, results) {
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
                        console.log(results);

                        res.json({
                            meta: 'No meta yet',
                            data: results[0]
                        });
                    }
                });



                // res.json({
                //     meta: 'No meta yet',
                //     data: results[0]
                // });
            }
        });

        console.log("step by step:3");



    } catch (err) {
        console.log('error happened - meep moop');
        res.json({
            errors: JSON.stringify(err),
        });
    }
}