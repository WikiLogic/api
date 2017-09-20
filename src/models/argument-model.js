"use strict";
var Utils = require('../_utils');
var Arango = require('../_arango/_db');
var ArgumentModel = {
    "id": "33",
    "premiseIds": ['1','2'],
    "probability": "null"
}
//Arguments that link to the claim are listed in the edges collection

/* /claims POST data
 * returns:
 * 
 *  - the claim that was just created (with no arguments, as it will not have nay yet)
 */

function create(newArgument){
    return new Promise(function (resolve, reject) {
        var ArgumentsCollection = Arango.getArgumentCollection();
        var datetime = Utils.getCreateDateForDb();
        ArgumentsCollection.save({
            "parentClaimId": newArgument.parentClaimId,
            "probability": newArgument.probability,
            "premisIds": newArgument.premisIds, //this may not actually be needed - details will be held in the edge collection
            "type": newArgument.type,
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "parentClaimId": newArgument.parentClaimId,
                "probability": newArgument.probability,
                "premisIds": newArgument.premisIds,
                "type": newArgument.type,
                "creationDate": datetime,
                "_id": meta._id,
                "_key": meta._key
            });
        }).catch((err) => {
            reject(err);
        });
    });
}

function getById(id){
    return new Promise(function (resolve, reject) {
        var ArgumentsCollection = Arango.getArgumentCollection();
        ArgumentsCollection.document(id).then((argumentObject) => {
            resolve(argumentObject);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getByKey(key){
    let id = key.replace('arguments/', '');
    return getById(id);
}

function remove(_key){
    return new Promise(function (resolve, reject) {
        var ArgumentsCollection = Arango.getArgumentCollection();
        ArgumentsCollection.remove(_key).then((meta) => {
            resolve(meta);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    create,
    getById,
    getByKey,
    remove
};