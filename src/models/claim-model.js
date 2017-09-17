"use strict";
var Utils = require('../_utils');
var Arango = require('../_arango/_db');
var ClaimModel = {
    "id": "33",
    "text": "text text",
    "probability": "null"
}
//Arguments that link to the claim are listed in the edges collection

/* /claims POST data
 * returns:
 * 
 *  - the claim that was just created (with no arguments, as it will not have nay yet)
 */

function create(newClaim){
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

function getById(id){
    return new Promise(function (resolve, reject) {
        var ClaimsCollection = Arango.getClaimCollection();
        ClaimsCollection.document(id).then((claimObject) => {
            resolve({
                text: claimObject.text,
                probability: claimObject.probability,
                creationDate: claimObject.creationDate,
                id: claimObject._key,
                _id: claimObject._id,
                _key: claimObject._key
            });
        }).catch((err) => {
            reject(err);
        });
    })
}

function getByText(text){
    return new Promise(function (resolve, reject) {
        Arango.db.query(`
            FOR doc IN claims 
                FILTER doc.text == "${text}"
                RETURN doc
            `).then((cursor) => {

                cursor.all().then((data) => {
                    resolve(data);
                }).catch((err) => {
                    reject(err);
                });

            }).catch((err) => {
                reject(err);
            });
    });
}

module.exports = {
    create,
    getById,
    getByText
};