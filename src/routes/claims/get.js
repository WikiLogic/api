var ClaimModel = require("../../queries/claim-model");
var PremiseLinkModel = require("../../queries/premise-link-model.js");
var ArgumentModel = require("../../queries/argument-model.js");

//TODO move this to a central point somewhere
function claimFormatter(claim) {
  let returnClaim = {
    text: claim.text,
    probability: claim.probability,
    creationDate: claim.creationDate,
    _id: claim._id,
    _key: claim._key,
    arguments: claim.arguments
  };
  return returnClaim;
}

//Plain get claim - return a list of the most recent.
//TODO: take query params
module.exports = {
  get: function() {
    return new Promise((resolve, reject) => {
      ClaimModel.getRecent().then(data => {
        let resultsArray = [];

        for (var c = 0; c < data.length; c++) {
          resultsArray.push(claimFormatter(data[c]));
        }

        resolve(resultsArray);
      });
    });
  },
  search: function(searchTerm) {
    return new Promise((resolve, reject) => {
      ClaimModel.search(searchTerm).then(data => {
        let resultsArray = [];

        for (var c = 0; c < data.length; c++) {
          resultsArray.push(claimFormatter(data[c]));
        }

        resolve(resultsArray);
      });
    });
  }
};
