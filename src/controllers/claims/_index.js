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




module.exports = {
    search: search,
    getById: getById,
    create: create,
    remove: remove
}