var ClaimModel = require('../models/claim-model.js');
var ArgumentModel = require('../models/argument-model.js');
var PremiseLinks = require('../models/premise-link-model.js');
var Utils = require('../_utils');
var Arango = require('../_arango/_db');
var ProbabilityCalculator = require('../probability');

/*
   CLAIM     (db call claim by id)                        DONE
  argLinks   (db call premise links with claim id)        DONE
  ARGUMENT   (db call arguments by id from premise links) DONE
premiseLinks (db call premise links by argument id)
   CLAIM     (db call claim by id from premise links)
*/

function create(req, res){
    //console.log("TODO: ARGUMENT.CREATE escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.body.hasOwnProperty('parentClaimId') || req.body.parentClaimId == '') {
        errors.push({title:'parentClaimId is required'});
    }
    
    if (!req.body.hasOwnProperty('type') || req.body.type == '') {
        errors.push({title:'type is required'});
    }
    
    if (!req.body.hasOwnProperty('premiseIds') || req.body.premiseIds == '') {
        errors.push({title:'premiseIds is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }


    let returnParentClaimObject = {}; //this is what will eventually be returned
    let parentClaimArguments = [];
    var parentClaimId = req.body.parentClaimId;
    var type = req.body.type;
    var premiseIds = req.body.premiseIds;
    var probability = 0.5;
    let dupeCheckPass = true;

    //the eventual return value will be the parent claim, so let's get that first
    ClaimModel.getById(parentClaimId).then((parentClaim) => {
        returnParentClaimObject = parentClaim;

        //now to fill it's arguments, we need to get a list of the arguments that point to our parent claim
        return PremiseLinks.getEdgesWithId(parentClaim._id);
    }).then((parentArgEdges) => {
        //now we know the _ids of the arguments that point to our parent claim...
        let promises = [];
        for (var a = 0; a < parentArgEdges.length; a++) {
            //go get the actual argument object
            promises.push(ArgumentModel.getByKey(parentArgEdges[e]._from));
        }

        return Promise.all(promises);

    }).then((existingArguments) => {
        //now we have all the existing argument objects for the parent claim - but only with meta data for now...
        returnParentClaimObject.arguments = [];
        let linkPromises = [];
        for (let a = 0; a < existingArguments.length; a++){
            //so fill up the returnParentClaimObject
            returnParentClaimObject.arguments.push(existingArguments[a]);
            //and get the links that point to these arguments
            linkPromises.push(PremiseLinkModel.getEdgesWithId(existingArguments[a]._id));
        }
        
        return Promise.all(linkPromises);

    }).then((edges) => {
        //returned as an array of arrays
        let edgesPointingToArguments = [].concat.apply([], edges);
        //These edges tell us what premise ids are pointing at each of our arguments.
        //So go through the arguments and give them a note of what premises they should be expecting
        for (var a = 0; a < returnParentClaimObject.arguments.length; a++) {
            //now we're looking at returnClaim.arguments[a] and all it has is metadata, no premises yet
            returnParentClaimObject.arguments[a].premises = [];
            //check any of the links for this argument id
            for (var l = 0; l < edgesPointingToArguments.length; l++) {
                if (edgesPointingToArguments[l]._to == returnParentClaimObject.arguments[a]._id) {
                    returnParentClaimObject.arguments[a].premises.push({
                        _id: edgesPointingToArguments[l]._from
                    });
                }
            }
        }

        //now we have the premise ids in each arguemtn, we need to go and get the actual premise objects
        let promises = [];
        for (let p = 0; p < edgesPointingToArguments.length; p++) {
            promises.push(ClaimModel.getById(edgesPointingToArguments[p]._from));
        }
        return Promise.all(promises);
    }).then((premiseObjects) => {
        
        //now we can go through the arguments and their premises to fill in all the data
        for (var a = 0; a < returnParentClaimObject.arguments.length; a++) {
            //now go through the arguemtn premises (they only have their ids at the moment)
            for (var pid = 0; pid < returnParentClaimObject.arguments[a].premises.length; pid++) { //pid for premise id
                //now we're trying to fill returnParentClaimObject.arguments[a].premises[pid] with real data
                for (let po = 0; po < premiseObjects.length; po++) { //po for premise object
                    if (premiseObjects[po]._id == returnParentClaimObject.arguments[a].premises[pid]._id) {
                        returnParentClaimObject.arguments[a].premises[pid] = premiseObjects[po];
                    }
                }
            }
        }

        //now we should have the praent claim, it's arguemtns, and each argument's premise objects filled in
        //time to check if the new claim we're trying to add is a duplicate

        
        //check to see if the argument we're looking to create already exists:
        for (var a = 0; a < existingArguments.length; a++) {
            if (existingArguments[a].type == type) {
                //check all the premise ids in this argument
                if (Utils.doArraysMatch(existingArguments[a].premiseIds, premiseIds)) {
                    dupeCheckPass = false;
                }
            }
        }

        //if there is an existing argument that is the same - no need to go any further, just return the parent claim.
        if (!dupeCheckPass) {
            returnParentClaimObject.arguments = existingArguments;
            res.status(200);
            res.send({data: {claim: returnParentClaimObject} });
        } else {
            //if the new argument is not a duplicate, it's time to start making it!
            //get the premises for the argument
            let promises = [];
            for (var p = 0; p < premiseIds.length; p++) {
                promises.push(ClaimModel.getById(premiseIds[p]));
            }
            return Promise.all(promises);
        }
    }).then((premises) => {
        //get the probability for this argument 
        let newArgProbability = ProbabilityCalculator.getArgumentProbability(premises);
        return ArgumentModel.create({ parentClaimId, type, probability: newArgProbability });

    }).then((newArgumentNode) => {
        //create the premise link between the argument and the parent claim
        existingArguments.push(newArgumentNode);
        returnParentClaimObject.arguments = existingArguments; 
        let newClaimProbability = ProbabilityCalculator.getClaimProbability(returnParentClaimObject.arguments);
        returnParentClaimObject.probability = newClaimProbability;
        
        //save new probabillity that was worked out for the parent claim
        ClaimModel.updateProbability(returnParentClaimObject._id, newClaimProbability).then((meta) => {
            
        }).catch((err) => {
            console.log('claim failed to update with new probability :(', err);
        });

        return PremiseLinks.create(newArgumentNode._id, returnParentClaimObject._id, type);
        
    }).then((data) => {
        //The new link has been created! The argument node was added in the last step so we're actually good to return now.
        //now lets get a quick update on the claim's probability
        res.status(200);
        res.send({data: {claim: returnParentClaimObject} });

    }).catch((err) => {
        res.status(500);
        res.json({
            errors:[{title:'Argument.create: checking parent claim for dups failed'}]
        });
    });
}

function remove(req, res) {
    //console.log("TODO: ARGUMENT.REMOVE escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.body.hasOwnProperty('_id') || req.body._id == '') {
        errors.push({title:'_id is required'});
    }

    if (errors.length > 0) {
        res.status(400);
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
    create: create,
    remove: remove
};