//just creates the argument node, other people will attach them to claims. I think.
"use strict";
var Utils = reuire('../_utils');
var Arango = require('../_arango/_db');
var ArgumentModel = {
    "meta": "No meta yet",
    "data": {
        "id": "33",
        "parentClaimId": "id",
        "type": "FOR / AGAINST", // or 1 / 0 ?
        "premisIds": [],
        "probability": "null",
        "creationDate": ""
    }
}

module.exports = function(newArgument){
    return new Promise(function (resolve, reject) {
        var ArgumentsCollection = Arango.getArgumentCollection();
        var datetime = Utils.getCreateDateForDb();
        ArgumentsCollection.save({
            "parentClaimId": newArgument.parentClaimId,
            "probability": newArgument.probability,
            "premisIds": newArgument.premisIds,
            "type": newArgument.type,
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "parentClaimId": newArgument.parentClaimId,
                "probability": newArgument.probability,
                "premisIds": newArgument.premisIds,
                "type": newArgument.type,
                "creationDate": datetime,
                "id": meta._key
            });
        }).catch((err) => {
            reject(err);
        });
    });
}