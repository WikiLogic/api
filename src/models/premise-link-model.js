var Arango = require('../_arango/_db');
var Utils = require('../_utils');

//create a premise link between argId and claimId of type, then reutrn it
function create(fromKey, toKey, type){
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        var datetime = Utils.getCreateDateForDb();
        PremiseCollection.save({
            "_from": fromKey,
            "_to": toKey,
            "type": type,
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "_from": fromKey,
                "_to": toKey,
                "type": type,
                "creationDate": datetime,
                "_id": meta._id,
                "_key": meta._key
            });
        }).catch((err) => {
            console.log('FAIL: premise link creation fail');
            reject(err);
        });
    });
}

//claims are used in arguments
function createUsedInEdge(fromKey, toKey) {
    if (fromKey.indexOf('claims/') == -1) {
        console.log('WARNING only claims can be USED_IN arguments, you\re trying to use:', fromKey);
    }
    if (toKey.indexOf('arguments/') == -1) {
        console.log('WARNING only arguments can have USED_IN edges pointing _to them, you\re trying to point _to:', toKey);
    }
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        var datetime = Utils.getCreateDateForDb();
        PremiseCollection.save({
            "_from": fromKey,
            "_to": toKey,
            "type": "USED_IN",
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "_from": fromKey,
                "_to": toKey,
                "type": "USED_IN",
                "creationDate": datetime,
                "_id": meta._id,
                "_key": meta._key
            });
        }).catch((err) => {
            console.log('FAIL: premise link creation fail');
            reject(err);
        });
    });
}

//claims have arguments FOR or AGAINST, to the argument points to the claim
function createArgumentEdge(fromKey, toKey, type) {
    if (fromKey.indexOf('arguments/') == -1) {
        console.log('WARNING only arguments can point an argument edge, you\re trying to point:', fromKey);
    }
    if (toKey.indexOf('claims/') == -1) {
        console.log('WARNING only claims can have an argument edge pointing at them, you\re trying to point:', toKey);
    }
    if (type !== 'FOR' && type !== 'AGAINST') {
        console.log('WARNING argument edges can only be of type FOR or AGAINST, you\'re trying to set one of type:', type);
    }
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        var datetime = Utils.getCreateDateForDb();
        PremiseCollection.save({
            "_from": fromKey,
            "_to": toKey,
            "type": type,
            "creationDate": datetime
        }).then((meta) => {
            resolve({
                "_from": fromKey,
                "_to": toKey,
                "type": type,
                "creationDate": datetime,
                "_id": meta._id,
                "_key": meta._key
            });
        }).catch((err) => {
            console.log('FAIL: premise link creation fail');
            reject(err);
        });
    });
}

//will get all edges _to or _from the given id
function getEdgesWithId(documentId){ // needs the id in the format: collection/key
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        PremiseCollection.edges(documentId).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    });
}

//arguments are used in claims, so id should include "claims/"
function getUsedInEdgesPointingTo(id){
    if (id.indexOf('claims/') == -1) {
        console.log('WARNING getUsedInEdgesPointingTo will only return edges that point to claims. You\'re looking for edges pointing to:', id);
    }
    return new Promise(function (resolve, reject) {
        Arango.db.query(`
            FOR doc IN premisLinks
            FILTER doc.type == "USED_IN" && doc._to == "${id}" 
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

//claims have premise edges pointing to arguments, so id should include "arguments/"
function getPremiseEdgesPointingTo(id){
    if (id.indexOf('arguments/')) {
        console.log('WARNING getPremiseEdgesPointingTo will only return edges that point to an argument. You\'re looking for edged pointing to:', id);
    }
    return new Promise(function (resolve, reject) {
        console.log('QUERY', id);
        Arango.db.query(`
            FOR doc IN premisLinks
            FILTER (doc.type == "FOR" || doc.type == "AGAINST") && doc._to == "${id}" 
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

function remove(premisLink){
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        PremiseCollection.remove(premisLink._key).then((meta) => {
            resolve(meta);
        }).catch((err) => {
            reject(err);
        });
    });
}

function status(){
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        PremiseCollection.figures().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    create,
    createUsedInEdge,
    createArgumentEdge,
    remove,
    getEdgesWithId,
    getUsedInEdgesPointingTo,
    status
}