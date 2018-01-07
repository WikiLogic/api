var ClaimModel = require('../../models/claim-model.js');
var ArgumentModel = require('../../models/argument-model.js');
var PremiseLinks = require('../../models/premise-link-model.js');
var Utils = require('../../_utils');
var Arango = require('../../_arango/_db');
var ProbabilityCalculator = require('../../probability');

module.exports = function remove(req, res) {
    //console.log("TODO: ARGUMENT.REMOVE escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.body.hasOwnProperty('_id') || req.body._id == '') {
        errors.push({title:'_id is required'});
    }

    if (errors.length > 0) {
        res.status(200);
        res.json({ errors: errors });
        return;
    }

    let _id = req.body._id;
    //delete the premis links from this argument
    //get all the edges (premis links)
    PremiseLinks.getEdgesWithId(_id).then((edges) => {
        let promises = [];
        for (var p = 0; p < edges.length; p++){
            promises.push(PremiseLinks.remove(edges[p]));
        }
        return Promise.all(promises);
    }).then((meta) => {
        return ArgumentModel.remove(_id);
    }).then((meta) => {
        res.status(200);
        res.json({data: meta});
    }).catch((err) => {
        console.log("Deleting argument failed", err);
        reject(err);
    });
}