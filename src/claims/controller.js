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

function hydrateClaimArguments(claim){

}

function getById(req, res){
    console.log("TODO: CLAIMS.GETBYID escape post data: ", JSON.stringify(req.body));

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

    ClaimModel.getById(_key).then((claim) => {
        //now to hydrate the claim's arguments
        PremiseLinkModel.getEdgesWithId(claim._id).then((edges) => {
            let promises = [];
            for (var e = 0; e < edges.length; e++) {
                promises.push(ArgumentModel.getByKey(edges[e]._from));
            }
            Promise.all(promises).then((results) => {
                claim.arguments = results;
                res.status(200);
                res.json({data: { claim: claim }});
            }).catch((err) => {
                console.log('getting claim by id - failed to get arguments linked to the claim', err);
                res.status(500);
                res.json({errors:[
                    {title: 'getting claim by id - failed to get arguments linked to the claim'}
                ]});
            });
        }).catch((err) => {
            res.status(500);
            res.json({errors:[
                {title: 'getting claim by id - failed to get links to claim arguments'}
            ]});
        });
    }).catch((err) => {
        console.log('get claim by id error: ', err.ArangoError);
        res.status(500);
        res.json({errors:[{title:'get claim by id error'}]});
    })
}

function create(req, res){
    console.log("TODO: CLAIMS.CREATE escape post data: ", JSON.stringify(req.body));

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
    console.log("TODO: CLAIMS.SEARCH escape post data: ", JSON.stringify(req.query));

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
        console.log("GOT DATA:", data);
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
    console.log("TODO: CLAIMS.REMOVE escape post data: ", JSON.stringify(req.body));

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