var Arango = require('../_arango/_db');
var createPremiseLink = require('./link-arg-to-claim.js');

//create a premise link between argId and claimId of type, then reutrn it
function create(argId, claimId, type){
    return new Promise(function (resolve, reject) {
        createPremiseLink(argId, claimId, type).then((data) => {
            resolve(data);
        }).catch((err) => {
            console.log('creating a premise link errored out', err.ArangoError);
            res.status(500);
            res.send({
                errors: [
                    { title: 'creating a premise link errored out' }
                ]
            });
        });
    });
}

module.exports = {
    create: create
}