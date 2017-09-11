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
            "creationDate": datetime,
            "arguments": []
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
}