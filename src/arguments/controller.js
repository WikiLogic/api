var ClaimModel = require('../models/claim-model.js');
var ArgumentModel = require('../models/argument-model.js');
var PremiseLinks = require('../models/premise-link-model.js');
var Utils = require('../_utils');
var Arango = require('../_arango/_db');
var ProbabilityCalculator = require('../probability');

var _create = require('./_create.js');
var _remove = require('./_remove.js');


function getById(argumentId) {
    //TODO: turn this into a route not just a return
    return new Promise(function (resolve, reject) {
        ArgumentModel.getById(argumentId).then((argumentObject) => {
            resolve(argumentObject);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    getById: getById,
    create: _create,
    remove: _remove
};