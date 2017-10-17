"use strict";
var Utils = require('../_utils');
var Arango = require('../_arango/_db.js');
var aql = require('arangojs').aql;
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
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "text": newClaim.text,
                "probability": newClaim.probability,
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

    if (_id.indexOf('claims/') > -1) {
        _id = _id.replace('claims/', '');
    }

    return new Promise(function (resolve, reject) {
        var ClaimsCollection = Arango.getClaimCollection();
        ClaimsCollection.document(_id).then((claimObject) => {
            resolve({
                text: claimObject.text,
                probability: claimObject.probability,
                creationDate: claimObject.creationDate,
                id: claimObject._key,
                _id: claimObject._id,
                _key: claimObject._key
            });
        }).catch((err) => {
            console.log('Getting claim by id failing');
            reject(err);
        });
    });
}

function search(term){
    //Needs to be a kind of fuzzy text search - super basic for now
    return new Promise(function (resolve, reject) {
        const claimCollection = Arango.getClaimCollection();
        const query = aql`
            FOR doc IN FULLTEXT(${claimCollection}, "text", ${term})
            RETURN doc`;
        Arango.db.query(query).then((cursor) => {
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

function getByText(text){
    //Needs to be a kind of fuzzy text search - super basic for now
    return new Promise(function (resolve, reject) {
        const claimCollection = Arango.getClaimCollection();
        const query = aql`FOR doc IN ${claimCollection}
                FILTER doc.text == ${text}
                RETURN doc`;
        Arango.db.query(query).then((cursor) => {
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

function updateProbability(_id, newProbability){
    return new Promise(function (resolve, reject) {
        var ClaimsCollection = Arango.getClaimCollection();
        ClaimsCollection.update(_id, {probability: newProbability}).then((meta) => {
            resolve(meta);
        }).catch((err) => {
            reject(err);
        });
    });
}

function remove(_key){
    return new Promise(function (resolve, reject) {
        var ClaimsCollection = Arango.getClaimCollection();
        ClaimsCollection.remove(_key).then((meta) => {
            resolve(meta);
        }).catch((err) => {
            reject(err);
        });
    });
}

function status(){
    return new Promise(function (resolve, reject) {
        var ClaimsCollection = Arango.getClaimCollection();
        ClaimsCollection.figures().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    create,
    getById,
    getByText,
    search,
    updateProbability,
    remove,
    status
};