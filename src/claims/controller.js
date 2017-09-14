var getRandom = require('./random.js');
var createClaim = require('./create-claim.js');
var getClaimById = require('./get-claim-by-id');
var getClaimByText = require('./get-claim-by-text.js');

function getById(req, res){
    console.log("TODO: escape post data: ", JSON.stringify(req.body));

    let errors = [];

    if (!req.params.hasOwnProperty('claimid') || req.params.claimid == '') {
        errors.push({title:'ID is required'});
    }

    if (errors.length > 0) {
        res.status(400);
        res.json({ errors: errors });
        return;
    }

    let id = req.params.claimid;

    getClaimById(id).then((claim) => {
        let returnClaim = {
            text: claim.text,
            probability: claim.probability,
            creationDate: claim.creationDate,
            id: claim._key
        }
        res.status(200);
        res.json({data: {claim:returnClaim} });
    }).catch((err) => {
        console.log('get claim by id error: ', err);
        res.status(500);
        res.json({errors:[{title:'get claim by id error'}]});
    })
}

function create(req, res){
    console.log("TODO: escape post data: ", JSON.stringify(req.body));

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

    getClaimByText(text).then((data) => {
        if (data.length > 0) {
            let returnClaim = {
                text: data[0].text,
                probability: data[0].probability,
                creationDate: data[0].creationDate,
                id: data[0]._key
            }
            console.log('----- returning claim that already exists');
            res.status(200);
            res.json({
                data: {claim:returnClaim} ,
                errors: [{title:'Claim already exists'}]
            });
            return;
        }
        console.log('----- continuing after existing claim check has happened');

        createClaim({text: text, probability: probability}).then((newClaim) => {
            let returnClaim = {
                text: newClaim.text,
                probability: newClaim.probability,
                creationDate: newClaim.creationDate,
                id: newClaim._key
            }
            console.log('sending 200');
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

}

module.exports = {
    search: search,
    getRandom: getRandom,
    getById: getById,
    create: create
}