"use strict";

/**
 * Argument -----> Claim
 * Here we forge the link
 */

var Utils = require('../_utils');
var Arango = require('../_arango/_db');

module.exports = function(argDbKey, claimDbKey, type){
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        var datetime = Utils.getCreateDateForDb();
        PremiseCollection.save({
            "_from": argDbKey,
            "_to": claimDbKey,
            "type": type,
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "_from": argDbKey,
                "_to": claimDbKey,
                "type": type,
                "creationDate": datetime,
                "id": meta._key
            });
        }).catch((err) => {
            reject(err);
        });
    });
}