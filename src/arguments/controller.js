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

    var parentClaimId = req.body.parentClaimId;
    var type = req.body.type;
    var premisIds = req.body.premisIds;
    var probability = 0.5;

    if (!req.body.hasOwnProperty('probability') || req.body.probability == '') {
        errors.push({title:'probability is recommended for this early stage of WL'});
    } else {
        probability = req.body.probability;
    }

    //check to see that there are no duplicates
    PremiseLinks.getEdgeWithId(parentClaimId).then((edges) => {
        //get all the argument's from those edges
        let promises = [];
        for (var e = 0; e < edges.length; e++) {
            promises.push(ArgumentModel.getByKey(edges[e]._from));
        }
        Promise.all(promises).then((existingArguments) => {
            
            //check all the results to see if any are the proposed new argument
            let dupeCheckPass = true;
            for (var a = 0; a < existingArguments.length; a++) {
                if (existingArguments[a].type == type) {
                    //check all the premise ids in this argument
                    if (Utils.doArraysMatch(existingArguments[a].premisIds, premisIds)) {
                        dupeCheckPass = false;
                    }
                }
            }


            ClaimModel.getById(parentClaimId).then((parentClaim) => {
                if (!dupeCheckPass) {
                    //populate the parent claim with existingArguments
                    parentClaim.arguments = existingArguments;
                    res.status(200);
                    res.send({data: {claim: parentClaim} });
                }
                //create new argument
                ArgumentModel.create({ parentClaimId, type, premisIds, probability }).then((newArgumentNode) => {
                    //create the premise link between the argument and the parent claim
                    existingArguments.push(newArgumentNode);
                    PremiseLinks.create(newArgumentNode._id, parentClaim._id, type).then((data) => {
                        //got the new link created. add the new argument to the existingArguments, add them to the parent claim, return
                        parentClaim.arguments = existingArguments;
                        res.status(200);
                        res.send({data: {claim: parentClaim} });
                    }).catch((err) => {
                        console.log('Argument.create creating a new premise link failed: ', err);
                        res.status(500);
                        res.send({errors:[{"title":"creating a new argument failed when trying to link it to the parent claim"}]});
                    });
                }).catch((err) => {
                    console.log('creating a new argument failed when trying to link it to the parent claim: ', err);
                    res.status(500);
                    res.send({errors:[{"title":"creating a new argument failed when trying to link it to the parent claim"}]});
                });
            }).catch((err) => {
                console.log('Argument.create - failed to get parent claim', err);
                res.status(500);
                res.json({errors:[
                    {title: 'Argument.create - failed to get parent claim'}
                ]});        
            });
        }).catch((err) => {
            console.log('Argument.create - failed to get arguments linked to by the parent claim', err);
            res.status(500);
            res.json({errors:[
                {title: 'Argument.create - failed to get arguments linked to by the parent claim'}
            ]});
        });
    }).catch((err) => {
        res.status(500);
        res.json({
            errors: [{title:'getting premise links to the proposed parent claim failed'}]
        })
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