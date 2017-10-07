var ClaimModel = require('../models/claim-model');
var PremiseLinkModel = require('../models/premise-link-model.js');
var ArgumentModel = require('../models/argument-model.js');

function claimFormatter(claim){
    let returnClaim = {
        text: claim.text,
        probability: claim.probability,
        creationDate: claim.creationDate,
        _id: claim._id,
        _key: claim._key,
        arguments: claim.arguments
    }
    return returnClaim;
}

/*
   CLAIM     (db call claim by id)                        DONE
  argLinks   (db call premise links with claim id)        DONE
  ARGUMENT   (db call arguments by id from premise links) DONE
premiseLinks (db call premise links by argument id)
   CLAIM     (db call claim by id from premise links)
*/
function getById(req, res){
    // console.log("TODO: CLAIMS.GETBYID escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.params.hasOwnProperty('_key') || req.params._key == '') {
        errors.push({title:'_key is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }

    let _key = req.params._key;
    let returnClaim = {};

    ClaimModel.getById(_key).then((claim) => {
        console.log("-1", claim);
        returnClaim = claim;
        //now to get the links's to the claims arguments
        return PremiseLinkModel.getPremiseEdgesPointingTo(claim._id);
    }).then((edges) => {
        console.log("--2", edges);
        if (edges.length == 0) {
            returnClaim.arguments = [];
            return Promise.resolve('Claim has no arguments');
        }

        //now to get the arguments those links point to
        let argumentPromises = [];
        for (var e = 0; e < edges.length; e++) {
            argumentPromises.push(ArgumentModel.getByKey(edges[e]._from));
        }

        return Promise.all(argumentPromises);

    }).then((argumentObjects) => {
        console.log("---3", argumentObjects);
        if (argumentObjects == 'Claim has no arguments') {
            return Promise.resolve('Claim has no arguments');
        }
        returnClaim.arguments = argumentObjects;

        //now to get the premise links pointing to these argument objects
        let linkPromises = [];
        for (var a = 0; a < argumentObjects.length; a++) {
            linkPromises.push(PremiseLinkModel.getUsedInEdgesPointingTo(argumentObjects[a]._id));
        }
        
        return Promise.all(linkPromises);

    }).then((links) => {
        console.log("----4", links);
        if (links == 'Claim has no arguments') {
            return Promise.resolve('Claim has no arguments');
        }
        //comes back as an array of arrays, each array is an array for a specific argument
        //TODO: find out if duplicates will happen here and should they be removed
        let mergedLinkArray = [].concat.apply([], links);
        //now run through each argument and put in a note for what premises it should have
        for (var a = 0; a < returnClaim.arguments.length; a++) {
            //now we're looking at returnClaim.arguments[a] and all it has is metadata, no premises yet
            returnClaim.arguments[a].premises = [];
            //check any of the links for this argument id
            for (var l = 0; l < mergedLinkArray.length; l++) {
                if (mergedLinkArray[l]._to == returnClaim.arguments[a]._id) {
                    returnClaim.arguments[a].premises.push({
                        _id: mergedLinkArray[l]._from
                    });
                }
            }
        }

        //at this point we have a claim with it's arguments but those arguments only have the ids of the premises that make them up

        //now to get the claims to populate those argument premises
        let premisePromises = [];
        for (var p = 0; p < mergedLinkArray.length; p++) {
            premisePromises.push(ClaimModel.getById(mergedLinkArray[p]._from));
        }
        
        return Promise.all(premisePromises); 

    }).then((premiseObjects) => {
        console.log("-----5", premiseObjects);
        if (premiseObjects != 'Claim has no arguments') {   
            //now run through each argument and fill it in
            for (var a = 0; a < returnClaim.arguments.length; a++) {
                //in an argument, but we need to look at each of it's premises to pull them out the premiseObjects
                for (var p = 0; p < returnClaim.arguments[a].premises.length; p++) {
                    //returnClaim.arguments[a].premises[p] only has a _id property. use that to find the right one from the given premiseObjects
                    for (var po = 0; po < premiseObjects.length; po++) {
                        if(returnClaim.arguments[a].premises[p]._id == premiseObjects[po]._id) {
                            returnClaim.arguments[a].premises[p] = premiseObjects[po];
                        }
                    }
                }
            }
        }
            
        res.status(200);
        res.json({data: { claim: returnClaim }});
    }).catch((err) => {
        if (!err) {
            res.status(200);
            res.json({data: { claim: returnClaim }});
        } else {
            console.log('get claim by id error: ', err);
            res.status(500);
            res.json({errors:[{title:'get claim by id error'}]});
        }
    })
}

function create(req, res){
    //console.log("TODO: CLAIMS.CREATE escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.body.hasOwnProperty('text') || req.body.text == '') {
        errors.push({title:'Text is required'});
    }

    if (!req.body.hasOwnProperty('probability') || req.body.probability == '') {
        errors.push({title:'Probability is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }

    var text = req.body.text;
    var probability = req.body.probability;

    ClaimModel.getByText(text).then((data) => {
        if (data.length > 0) {
            let returnClaim = claimFormatter(data[0]);
            res.status(200);
            res.json({
                data: {claim:returnClaim} ,
                errors: [{title:'Claim already exists'}]
            });
            return;
        }

        ClaimModel.create({text: text, probability: probability}).then((newClaim) => {
            let returnClaim = claimFormatter(newClaim);
            res.status(200);
            res.json({data:{claim:newClaim}});
        }).catch((err) => {
            console.log("create new claim error", err);
            res.status(500);
            res.json({errors:[{title:'create new claim error'}]});
        });

    }).catch((err) => {
        console.log('get claims by text error: ', err);
        res.status(500);
        res.json({errors:[{title:'get claims by text error'}]});
    });

}

function search(req, res){
    //console.log("TODO: CLAIMS.SEARCH escape post data: ", JSON.stringify(req.query));

    let errors = [];

    if (!req.query.hasOwnProperty('s') || req.query.s == '') {
        errors.push({title:'search term is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }

    var searchTerm = req.query.s;

    ClaimModel.search(searchTerm).then((data) => {
        let resultsArray = [];
        for (var c = 0; c < data.length; c++) {
            resultsArray.push(claimFormatter(data[c]));
        }
        
        res.status(200);
        res.json({
            data: {results:resultsArray}
        });
    });
}

function remove(req, res){
    //console.log("TODO: CLAIMS.REMOVE escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.body.hasOwnProperty('_key') || req.body._key == '') {
        errors.push({title:'_key is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }

    let _key = req.body._key;
    ClaimModel.remove(_key).then((meta) => {
        res.status(200);
        res.json({data:meta});
    }).catch((err) => {
        console.log('FAIL, remove claim error: ', err);
        res.status(500);
        res.json({ errors: [{title:'FAIL, remove claim error'}] });
    });
}

module.exports = {
    search: search,
    getById: getById,
    create: create,
    remove: remove
}