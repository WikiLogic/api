var getByClaimId = require('./get-arg-by-Id');
var createArgument = require('./create-argument.js');
var getClaimById = require('../claims/get-claim-by-id');
var Utils = reuire('../_utils');

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
    getClaimById(parentClaimId).then((claim) => {
        for (var a = 0; a < claim.arguments.length; a++) {
            if (Utils.doArraysMatch(claim.arguments[a], premisIds)) {
                errors.push({title: 'claim already has this argument'});
                res.status(200);
                res.json({data: claim, errors: errors});
                return;
            }
        }

        //looks like it's a new argument - time to add it.

        createArgument({ parentClaimId, type, premisIds, probability }).then((newArgumentNode) => {
            //now we have to link the new argument node... I think

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