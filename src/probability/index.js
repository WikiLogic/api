var ClaimRatio = require('./claim-ratio.js');
var MultiplyPremises = require('./multiply-premises.js');
/**
 * Takes a claim object hydrated with arguments
 * Returns the probability of that claim (not the entire claim object)
 */
function getClaimProbability(args){
    if (!Array.isArray(args)) {
        console.error('GET CLAIM PROBABILITY: claim needs an array of arguments for this to work', args);
        return null;
    }

    return ClaimRatio(args);
}


/**
 * Takes an argument object with hydrated premises
 * returns the probability of that argument (not the entire argument object)
 */
function getArgumentProbability(premises){
    if (!Array.isArray(premises)) {
        console.error('GET ARGUMENT PROBABILITY: argument needs an array of premises for this to work', premises);
        return null;
    }

    return MultiplyPremises(premises);
}

module.exports = {
    getClaimProbability: getClaimProbability,
    getArgumentProbability: getArgumentProbability
}