var ClaimModel = require('../../models/claim-model');
var PremiseLinkModel = require('../../models/premise-link-model.js');
var ArgumentModel = require('../../models/argument-model.js');

module.exports = function remove(req, res){
    //console.log("TODO: CLAIMS.REMOVE escape post data: ", JSON.stringify(req.body));

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
    ClaimModel.remove(_id).then((meta) => {
        //get all the supporting / opposing arguments for this claim.
        //we only need to remove the links as the arguments might be used by other equivolent claims
        return PremiseLinkModel.getPremiseEdges('_to', _id);
    }).then((premiseEdgesToRemove) => {
        let promises = [];
        for (var p = 0; p < premiseEdgesToRemove.length; p++){
            promises.push(PremiseLinks.remove(premiseEdgesToRemove[p]));
        }
        return Promise.all(promises);
    }).then((meta) => {
        //Now get all the arguments that this claim is used in
        //we'll remove the links and also the arguments if they only had this claim in them
        return PremiseLinkModel.getUsedInEdges('_from', _id);
    }).then((usedInEdgesToRemove) => {
        //now get the arguments at the other end of those edges
        let promises = [];
        for (var p = 0; p < usedInEdgesToRemove.length; p++){
            promises.push(PremiseLinks.remove(usedInEdgesToRemove[p]));
        }
        return Promise.all(promises);
    }).then((meta) => {
        res.status(200);
        res.json({data:meta});
    }).catch((err) => {
        console.log('FAIL, remove claim error: ', err);
        res.status(500);
        res.json({ errors: [{title:'FAIL, remove claim error'}] });
    });
}