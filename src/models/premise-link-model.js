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
    remove,
    getEdgesWithId,
    status
}