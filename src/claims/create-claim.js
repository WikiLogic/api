"use strict";
var Arango = require('../_arango/_db');
var checkIfUnique = require('./check-if-unique');
var ClaimModel = {
    "meta": "No meta yet",
    "data": {
        "id": "33",
        "text": "text text",
        "probability": "null",
        "arguments": []
    }
}

/* /claims POST data
 * returns:
 * 
 *  - the claim that was just created (with no arguments, as it will not have nay yet)
 */

module.exports = function(req, res){
    console.log("TODO: escape post data");

    let errors = [];

    if (!req.body.hasOwnProperty('test') || req.body.text == '') {
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


    checkIfUnique({
        text:text, 
        probability:probability
    }).then((isUnique) => {
        
        if (!isUnique) {
            res.status(400);
            res.json({message: "Duplicate credentials"});
            return;
        }

        var ClaimsCollection = Arango.getClaimCollection();
        var datetime = new Date().toISOString().replace(/T/, ' ').substr(0, 10);
        ClaimsCollection.save({
            "text": text,
            "probability": probability,
            "creationDate": datetime,
            "arguments": []
        }).then((meta) => {
            res.status(200);
            res.json({
                "text": text,
                "probability": probability,
                "creationDate": creationDate,
                "id": meta._key
            });
        },(err) => {
            res.status(500);
            res.send(err);
        }).catch((err) => {
            res.status(500);
            res.send(err);
        });
    });
}