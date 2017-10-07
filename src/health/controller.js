var ClaimModel = require('../models/claim-model');
var PremiseLinkModel = require('../models/premise-link-model.js');
var ArgumentModel = require('../models/argument-model.js');

function check(req, res) {

    Promise.all([
        ClaimModel.status(),
        PremiseLinkModel.status(),
        ArgumentModel.status()
    ]).then((results) => {
        res.status(200);
        res.json({
            data: results
        });
    }).catch((err) => {
        console.log('Arango health check fail', err);
        res.status(500);
        res.json({
            errors: [{title: 'Arango health check failed', err: err}]
        });
    });
}

module.exports = {
    check: check
}