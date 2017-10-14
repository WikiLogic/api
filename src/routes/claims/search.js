var ClaimModel = require('../../models/claim-model');
var PremiseLinkModel = require('../../models/premise-link-model.js');
var ArgumentModel = require('../../models/argument-model.js');
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
module.exports = function search(req, res){
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