"use strict";
var Utils = reuire('../_utils');
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

module.exports = function(newClaim){
    return new Promise(function (resolve, reject) {
        var ClaimsCollection = Arango.getClaimCollection();
        var datetime = Utils.getCreateDateForDb();
        ClaimsCollection.save({
            "text": newClaim.text,
            "probability": newClaim.probability,
            "creationDate": datetime,
            "arguments": []
        }).then((meta) => {
            resolve({
                "text": newClaim.text,
                "probability": newClaim.probability,
                "creationDate": datetime,
                "id": meta._key
            });
        }).catch((err) => {
            reject(err);
        });
    });
}