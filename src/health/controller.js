var db = require('../_arango/_db');

function check(req, res) {

    Promise.all([
        db.getCollectionCount('users'),
        db.getCollectionCount('arguments'),
        db.getCollectionCount('claims'),
        db.getCollectionCount('premiseLinks')
    ]).then((results) => {
        console.log('ARANGO HEALTH CHECK!', results);
    }).catch((err) => {
        console.log('Arango health check fail', err);
    });
}

module.exports = {
    check: check
}