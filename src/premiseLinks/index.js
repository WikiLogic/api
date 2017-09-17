var Arango = require('../_arango/_db');

//create a premise link between argId and claimId of type, then reutrn it
function create(argId, claimId, type){
    return new Promise(function (resolve, reject) {
        var ArgumentsCollection = Arango.getArgumentCollection(); // TODO: change this into the premise link collection
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

module.exports = {
    create: create
}