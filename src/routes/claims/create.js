var ClaimModel = require("../../queries/claim-model");
var validator = require("validator");

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
module.exports = function create(req, res) {
  let errors = [];

  if (!req.body.hasOwnProperty("text") || req.body.text == "") {
    errors.push({ title: "Text is requireds" });
  } else if (!validator.isAlphanumeric(req.body.username + "")) {
    errors.push({ title: "Claim can only have alphanumeric characters" });
  }

  if (!validator.isInt(req.body.probability + "", { min: 0, max: 100 })) {
    //if this fails, just set it to 50
    req.body.probability = 50;
  }

  if (errors.length > 0) {
    res.json({ errors: errors });
    return;
  }

  var text = validator.escape(req.body.text);
  var probability = Number(req.body.probability);

  ClaimModel.getByText(text)
    .then(data => {
      if (data.length > 0) {
        let returnClaim = claimFormatter(data[0]);
        res.json({
          data: { claim: returnClaim },
          errors: [{ title: "Claim already exists" }]
        });
        return;
      }

      ClaimModel.create({ text: text, probability: probability })
        .then(newClaim => {
          let returnClaim = claimFormatter(newClaim);

          res.json({ data: { claim: newClaim } });
        })
        .catch(err => {
          console.log("create new claim error", err);

          res.json({ errors: [{ title: "create new claim error" }] });
        });
    })
    .catch(err => {
      console.log("get claims by text error: ", err);

      res.json({ errors: [{ title: "get claims by text error" }] });
    });
};
