"use strict";
var db = require('../neo4j/neo-connection.js');

/* All that really changes between claim requests is the cypher query.
 */

module.exports = {
    bySearchTerm: function(req, res){
        console.log('getting claims by search term', req.query.search);
        var queryString = `MATCH (claim:Claim) WHERE claim.body CONTAINS "${req.query.search}" RETURN claim LIMIT 25`;
        getClaims(req, res, queryString);
    },
    byId: function(req, res){
        console.log('getting claims by ID', req.params.claimid);
        var queryString = `MATCH (claim:Claim) WHERE ID(claim) = ${req.params.claimid} RETURN claim LIMIT 25`;
        getClaims(req, res, queryString);
    },
    all: function(req, res){
        console.log('getting all claims');
        var queryString = `MATCH (claim:Claim) WHERE claim.body CONTAINS "${req.query.search}" RETURN claim LIMIT 25`;
        getClaims(req, res, queryString);
    }   
}

var getClaims = function(req, res, queryString){
    console.log('query string', queryString);
    try {
        db.cypher({
            query: queryString
        }, function (err, results) {
            console.log("HI");
            if (err) throw err;
            console.log("PHEW");
            if (!results) {
                console.log('No claims found.');
                res.json({
                    error: 'No claims found'
                });
            } else {
                var claims = [];

                if (results.length > 0){
                    results.map(function(match) {
                        console.log('match: ', match);

                        claims.push({
                            id: match.claim._id,
                            type: 'claim',
                            body: match.claim.properties.body,
                            state: match.claim.properties.state,
                        });
                    })
                }
                
                res.json({
                    meta: 'aint no meta here yet',
                    data: {
                        claims: claims
                    }
                });
            }
        });

    }
    catch(err){
        console.log('error happened - meep moop');
        res.json({
            errors: JSON.stringify(err),
        });
    }
}