var ClaimModel = require('../models/claim-model.js');
var ArgumentModel = require('../models/argument-model.js');
var PremiseLinks = require('../models/premise-link-model.js');
var Utils = require('../_utils');
var Arango = require('../_arango/_db');

function create(req, res){
    console.log("TODO: escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.body.hasOwnProperty('parentClaimId') || req.body.parentClaimId == '') {
        errors.push({title:'parentClaimId is required'});
    }
    
    if (!req.body.hasOwnProperty('type') || req.body.type == '') {
        errors.push({title:'type is required'});
    }
    
    if (!req.body.hasOwnProperty('premisIds') || req.body.premisIds == '') {
        errors.push({title:'premisIds is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }

    let parentClaimObject = {}; //this is what will eventually be returned
    let parentClaimArguments = [];
    var parentClaimId = req.body.parentClaimId;
    var type = req.body.type;
    var premisIds = req.body.premisIds;
    var probability = 0.5;
    let dupeCheckPass = true;

    if (!req.body.hasOwnProperty('probability') || req.body.probability == '') {
        errors.push({title:'probability is recommended for this early stage of WL'});
    } else {
        probability = req.body.probability;
    }

    //the eventual return value will be the parent claim, so let's get that first
    ClaimModel.getById(parentClaimId).then((parentClaim) => {
        parentClaimObject = parentClaim;
        //now to fill it's arguments, we need to get a list of the arguments that are linked
        return PremiseLinks.getEdgeWithId(parentClaim._id);
    }).then((edges) => {
        //get all the argument's from those edges - these are the things we'll check for duplicates
        let promises = [];
        for (var e = 0; e < edges.length; e++) {
            promises.push(ArgumentModel.getByKey(edges[e]._from));
        }
        return Promise.all(promises);
    }).then((existingArguments) => {
        //now we have 'hydrated' the parent claim
        parentClaimObject.arguments = existingArguments;
        
        //check to see if the argument we're looking to create already exists:
        for (var a = 0; a < existingArguments.length; a++) {
            if (existingArguments[a].type == type) {
                //check all the premise ids in this argument
                if (Utils.doArraysMatch(existingArguments[a].premisIds, premisIds)) {
                    dupeCheckPass = false;
                }
            }
        }

        //if there is an existing argument that is the same - no need to go any further, just return the parent claim.
        if (!dupeCheckPass) {
            //populate the parent claim with existingArguments
            parentClaimObject.arguments = existingArguments;
            res.status(200);
            res.send({data: {claim: parentClaimObject} });
        } else {
            //if the new argument is not a duplicate, it's time to start making it!
            ArgumentModel.create({ parentClaimId, type, premisIds, probability }).then((newArgumentNode) => {
                //create the premise link between the argument and the parent claim
                parentClaimObject.arguments.push(newArgumentNode);
                return PremiseLinks.create(newArgumentNode._id, parentClaimObject._id, type);
            }).then((data) => {
                //The new link has been created! The argument node was added in the last step so we're actually good to return now.
                res.status(200);
                res.send({data: {claim: parentClaimObject} });
            }).catch((err) => {
                res.status(500);
                res.json({
                    errors: [{title:'Argument.create: setting up the new argument failed'}]
                })
            });
        }
    }).catch((err) => {
        res.status(500);
        res.json({
            errors:[{title:'Argument.create: checking parent claim for dups failed'}]
        });
    });
}

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
    create: create
};