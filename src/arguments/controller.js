var getByClaimId = require('./get-arg-by-Id');
var createArgument = require('./create-argument.js');
var getClaimById = require('../claims/get-claim-by-id');
var PremiseLinks = require('../premiseLinks');
var Utils = require('../_utils');

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

    //get the parent claim & check to see if it has an argument like this already
    getClaimById(parentClaimId).then((parentClaim) => {
        for (var a = 0; a < parentClaim.arguments.length; a++) {
            if (Utils.doArraysMatch(parentClaim.arguments[a], premisIds)) {
                errors.push({title: 'parentClaim already has this argument'});
                res.status(200);
                res.json({data: parentClaim, errors: errors});
                return;
            }
        }

        //looks like it's a new argument - time to add it.

        createArgument({ parentClaimId, type, premisIds, probability }).then((newArgumentNode) => {
            //now we have to link the new argument node... I think
            console.log("newArgumentNode", newArgumentNode);
            console.log("parentClaim", parentClaim);
            PremiseLinks.create(newArgumentNode._id, parentClaim._id, type).then((data) => {
                console.log('----- premise link created: ', data);
                res.status(200);
                res.send({data:{claim: {
                    id: parentClaim._key,
                    text: parentClaim.text,
                    probability: parentClaim.probability,
                    creationDate: parentClaim.creationDate,
                    arguments: [{
                        parentClaimId: newArgumentNode.parentClaimId,
                        probability: newArgumentNode.probability,
                        premisIds: newArgumentNode.premisIds,
                        id: newArgumentNode.id,
                        type: newArgumentNode.type
                    }]
                }}});
            }).catch((err) => {
                console.log('creating a new argument failed when trying to link it to the parent claim: ', err);
                res.status(500);
                res.send({errors:[{"title":"creating a new argument failed when trying to link it to the parent claim"}]});
            });

        }).catch((err) => {
            console.log('get claims by text error: ', err);
            res.status(500);
            res.json({errors:[{title:'get claims by text error'}]});
        });
    });
}

module.exports = {
    getByClaimId: getByClaimId,
    create: create
};