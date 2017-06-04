"use strict";

var createClaim = require('./create-claim.js');
var createArgument = require('./create-argument.js');
var createExplanation = require('./create-explanation.js');

/* All that really changes between claim requests is the cypher query.
 */

module.exports = {
    claim: createClaim,
    argument: createArgument,
     explanation: createExplanation
}