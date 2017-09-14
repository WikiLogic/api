var Arango = require('../_arango/_db');
module.exports = function(key){
    return new Promise(function (resolve, reject) {
        var ClaimsCollection = Arango.getClaimCollection();
        ClaimsCollection.document(key).then((claimObject) => {
            resolve(claimObject);
        }).catch((err) => {
            reject(err);
        });
    });
}