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
            "probability": newArgument.probability,
            "type": newArgument.type,
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "probability": newArgument.probability,
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

function getById(_id){
    return new Promise(function (resolve, reject) {
        var ArgumentsCollection = Arango.getArgumentCollection();
        ArgumentsCollection.document(_id).then((argumentObject) => {
            resolve(argumentObject);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getByKey(_key){
    let _id = _key.replace('arguments/', '');
    return getById(_id);
}

function remove(_id){
    return new Promise(function (resolve, reject) {
        var ArgumentsCollection = Arango.getArgumentCollection();
        ArgumentsCollection.remove(_id).then((meta) => {
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