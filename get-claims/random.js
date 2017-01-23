"use strict";
var db = require('../neo4j/neo-connection.js');

/* /claims/random
 * returns 
 *  - a random array of claims
 */

module.exports = function(req, res){

    var builder = `MATCH (claim:Claim)-[:USED_IN]->(argGroup:ArgGroup)
                   WHERE (argGroup)-->(:Claim)
                   with argGroup, collect({ id: id(claim), body: claim.body, type: labels(claim)[0] }) as nodes
                   with { id: id(argGroup), body: argGroup.body, type: labels(argGroup)[0], SubNodes: nodes } as containerNode
                   RETURN {nodes: collect(containerNode) }`;
    var match100 = 'MATCH (claim) RETURN claim LIMIT 100';

    try {
        db.cypher({
            query: builder
        }, function (err, results) {
            
            if (err) throw err;
            
            if (!results) {
                console.log('No claims found.');
                res.json({
                    error: 'No claims found'
                });
            } else {
                var claims = [];

                res.json(results);

                // if (results.length > 0){
                //     results.map(function(match) {
                //         claims.push({
                //             id: match.claim._id,
                //             type: 'claim',
                //             body: match.claim.properties.body,
                //             state: match.claim.properties.state,
                //         });
                //     })
                // }
                
                // res.json({
                //     meta: 'aint no meta here yet',
                //     data: {
                //         claims: claims
                //     }
                // });
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