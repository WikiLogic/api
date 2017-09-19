var Arango = require('../_arango/_db');
var Utils = require('../_utils');

//create a premise link between argId and claimId of type, then reutrn it
function create(argDbKey, claimDbKey, type){
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

function getEdgeWithId(documentId){
    return new Promise(function (resolve, reject) {
        var PremiseCollection = Arango.getPremisLinkCollection();
        PremiseCollection.edges(documentId).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    create: create,
    getEdgeWithId: getEdgeWithId
}