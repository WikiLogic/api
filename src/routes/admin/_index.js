var ClaimModel = require('../../models/claim-model');
var PremiseLinkModel = require('../../models/premise-link-model.js');
var ArgumentModel = require('../../models/argument-model.js');
var Arango = require('../../_arango/_db.js');

function setup(req, res) {
    Arango.setup().then((meta) => {
        res.json(meta);
    }).catch((err) => {
        //error was alreayd logged.
        res.json({
            error: err
        });
    });
}

function status(req, res) {

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
    setup: setup,
    status: status
}