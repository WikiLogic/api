"use strict";
var neo = require('../_neo/_db.js'); 
var Arango = require('../_arango/_db');
var ClaimModel = {
    "meta": "No meta yet",
    "data": {
        "id": "33",
        "text": "text text",
        "probability": "null",
        "arguments": []
    }
}

/* /claims POST data
 * returns:
 * 
 *  - the claim that was just created (with no arguments, as it will not have nay yet)
 */

module.exports = function(req, res){
    console.log("TODO: escape post data");

    var ClaimsCollection = Arango.getClaimCollection();
    return new Promise(function (resolve, reject) {
        var datetime = new Date().toISOString().replace(/T/, ' ').substr(0, 10);
        ClaimsCollection.save({
            "text": claimText,
            "probability": initProbability,
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "text": text,
                "probability": probability,
                "creationDate": creationDate,
                "id": meta._key
            });
        },(err) => {
            reject(err);
        }).catch((err) => {
            reject(err);
        });
    });

    // try {
    //     //MERGE will only create a claim if it's unique ... O(n) I think
    //     neo.db.cypher({
    //         query: `MERGE (newClaim:Claim {text: "merge unique test"})
    //                 RETURN newClaim`
    //     }, function (err, results) {
    //         if (err) throw err;
            
    //         if (!results) {
    //             console.log('No claims found.');
    //             res.json({ error: 'No claims found' });
    //         } else {
    //             if (results.length == 0){
    //                 res.status(500);
    //                 res.json({
    //                     meta: 'Claim was not returned, probably means it wasn\'t created ',
    //                     data: {}
    //                 });  
    //                 return;  
    //             } 

    //             if (results.length > 1){
    //                 //should only return one claim when getting by id... something's wrong with the data (scream!)
    //                 console.log('many many many');
    //             }

    //             res.status(200);
    //             res.json({
    //                 meta: 'No meta yet',
    //                 data: results[0]
    //             });
    //         }
    //     });

    // }
    // catch(err){
    //     console.log('error happened - meep moop');
    //     res.json({
    //         errors: JSON.stringify(err),
    //     });
    // }
}