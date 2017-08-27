"use strict";
var neo = require('../_neo/_db.js'); 

/* /args/:claimid
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
        "text": "body text",
        "probability": "null",
        "arguments": [
            {
                "type": "SUPPORTS",
                "probability": "0.5",
                "premises": [
                    {
                        "id": "34",
                        "text": "premis body",
                        "probability": "0.5"
                    }
                ]
            }
        ]
    }
}

module.exports = function (req, res) {

    try {
        neo.db.cypher({
            query: `match (callingClaim:Claim)<-[:UsedFor]-(c:ArgGroup)<-[:UsedIn]-(n:Claim)
                    WHERE ID(callingClaim) = ${req.params.claimid} 
                    with c, collect({ id: id(n), text: n.text, probability: n.probability, type: labels(n)[0] }) as claims
                    with { id: id(c), type: labels(c)[0], probability: c.probability, subClaims: claims } as argument
                    return {arguments: collect(argument) }`
        }, function (err, results) {
            if (err) throw err;

            if (!results) {
                console.log('No claims found.');
                res.json({ error: 'No claims found' });
            } else {
                if (results.length == 0) {

                    res.json({
                        meta: 'No claims match ' + req.params.claimid,
                        data: {}
                    });
                    return;
                }

                if (results.length > 1) {
                    //should only return one claim when getting by id... something's wrong with the data (scream!)
                }

                res.json({
                    meta: 'No meta yet',
                    data: results[0]
                });
            }
        });

    }
    catch (err) {
        console.log('error happened - meep moop');
        res.json({
            errors: JSON.stringify(err),
        });
    }
}