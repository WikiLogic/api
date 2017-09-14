var createClaim = require('./create-claim.js');
var getClaimById = require('./get-claim-by-id');
var getClaimByText = require('./get-claim-by-text.js');

function claimFormatter(claim){
    let returnClaim = {
        text: claim.text,
        probability: claim.probability,
        creationDate: claim.creationDate,
        id: claim._key
    }
    return returnClaim;
}

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
        let returnClaim = claimFormatter(claim);
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
            let returnClaim = claimFormatter(data[0]);
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
            let returnClaim = claimFormatter(newClaim);
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
    console.log("TODO: escape post data: ", JSON.stringify(req.body));
    console.log('----- search router', req.query);

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

    getClaimByText(searchTerm).then((data) => {
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

module.exports = {
    search: search,
    getById: getById,
    create: create
}