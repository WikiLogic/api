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

module.exports = function create(req, res){
    // console.log("TODO: ARGUMENT.CREATE escape post data: ", JSON.stringify(req.body));

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
    var newArgument = {
        type: req.body.type,
        premises: []
    }

    for (var p = 0; p < req.body.premiseIds.length; p++) {
        newArgument.premises.push({
            _id: req.body.premiseIds[p]
        })
    }

    var type = req.body.type;
    var premiseIds = req.body.premiseIds;
    var probability = 0.5;
    let dupeCheckPass = true;

    //the eventual return value will be the parent claim, so let's get that first
    ClaimModel.getById(parentClaimId).then((parentClaim) => {
        console.log('CREATE ARGUMENT FOR ', parentClaim);
        returnParentClaimObject = parentClaim;

        //now to fill it's arguments, we need to get a list of the arguments that point to our parent claim
        return PremiseLinks.getPremiseEdges('_to', parentClaim._id);
    }).then((parentArgEdges) => {
        if (parentArgEdges.length == 0) {
            return Promise.resolve('Parent claim has no args');
        }
        //now we know the _ids of the arguments that point to our parent claim...
        let promises = [];
        for (var a = 0; a < parentArgEdges.length; a++) {
            //go get the actual argument object
            promises.push(ArgumentModel.getByKey(parentArgEdges[a]._from));
        }

        return Promise.all(promises);

    }).then((existingArguments) => {
        if (existingArguments == 'Parent claim has no args') {
            returnParentClaimObject.arguments = [];
            return Promise.resolve('Parent claim has no args');
        }

        //now we have all the existing argument objects for the parent claim - but only with meta data for now...
        returnParentClaimObject.arguments = existingArguments;
        let linkPromises = [];
        for (let a = 0; a < existingArguments.length; a++){
            //and get the links that point to these arguments
            linkPromises.push(PremiseLinks.getUsedInEdges('_to', existingArguments[a]._id));
        }
        
        return Promise.all(linkPromises);

    }).then((edges) => {
        if (edges == 'Parent claim has no args') {
            return Promise.resolve('Parent claim has no args');
        }

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
            console.log('4.6')
            promises.push(ClaimModel.getById(edgesPointingToArguments[p]._from));
        }
        return Promise.all(promises);
    }).then((premiseObjects) => {

        if (premiseObjects != 'Parent claim has no args') {

            //now we can go through the arguments and their premises to fill in all the data
            if (premiseObjects.length > 0 && returnParentClaimObject.hasOwnProperty('arguments')) {
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
            }
            
            //now we should have the parent claim, it's arguments, and each argument's premise objects filled in
            //time to check if the new claim we're trying to add is a duplicate
            
            //check to see if the argument we're looking to create already exists:
            if (returnParentClaimObject.hasOwnProperty('arguments')) {
                for (var a = 0; a < returnParentClaimObject.arguments.length; a++) {
                    if (Utils.doArgumentsMatch(returnParentClaimObject.arguments[a], newArgument)) {
                        res.status(200);
                        res.send({
                            data: { claim: returnParentClaimObject },
                            errors: [{ title: "Argument already exists for this parent claim" }]
                        });
                        return Promise.reject(false);
                    }
                }
            }
            
        } //end check to see if the parent claim actually has any arguments


        //if we make it this far - the new argument should be good to add! Time to really begin!
        //1. get all the premises that will make up the new argument
        let promises = [];
        for (let p = 0; p < newArgument.premises.length; p++) {
            promises.push(ClaimModel.getById(newArgument.premises[p]._id));
        }
        return Promise.all(promises);
    }).then((newArgumentPreises) => {
        newArgument.premises = newArgumentPreises;
        //get the probability for this argument 
        newArgument.probability = ProbabilityCalculator.getArgumentProbability(newArgument.premises);
        //nearly there, the new argument just needs to be added to the db now where it will get it's id
        return ArgumentModel.create(newArgument);
    }).then((newArgumentNode) => {
        newArgumentNode.premises = newArgument.premises;
        newArgument = newArgumentNode;
        //now we have th ecompleted argument object! Add it to the return claim
        if (returnParentClaimObject.hasOwnProperty('arguments')) {
            returnParentClaimObject.arguments.push(newArgumentNode);
        } else {
            returnParentClaimObject.arguments = [newArgumentNode];
        }

        //pen-penultimate step, create the link between the new argument node and the parent claim object
        return PremiseLinks.createArgumentEdge(newArgumentNode._id, returnParentClaimObject._id, newArgumentNode.type);

    }).then((newEdge) => {
        //penultimate step, create the premise links between the premises and the new argument node
        
        let promises = [];
        for (var p = 0; p < newArgument.premises.length; p++) {
            promises.push(PremiseLinks.createUsedInEdge(newArgument.premises[p]._id, newArgument._id));
        }
        return Promise.all(promises);
    }).then((newUsedInEdges) => {
        //final step get the new probability for this claim
        let newClaimProbability = ProbabilityCalculator.getClaimProbability(returnParentClaimObject.arguments);
        //set it in the return object
        returnParentClaimObject.probability = newClaimProbability;        
        //and save it to the db
        return ClaimModel.updateProbability(returnParentClaimObject._id, newClaimProbability);

    }).then((updatedClaimMeta) => {
        //The new link has been created! The argument node was added in the last step so we're actually good to return now.
        //now lets get a quick update on the claim's probability
        res.status(200);
        res.send({
            data: {
                claim: returnParentClaimObject,
                meta: updatedClaimMeta
            } 
        });

    }).catch((err) => {
        console.log("ARGUMENT CREATION ERROR", err);
        if (err) {
            res.status(500);
            res.json({
                errors:[{title:'Argument.create failed', err: err}]
            });
        }
    });
}

