/**
 * Works out the probability of an argument
 * @param {array} premises - all the premises that make up the argument in question
 */
module.exports = function multiplyPremises(premises){
    if (premises.length === 0) { return 0; } //if there are no premises - 0

    //just multiply them all together?
    var prob = 1;
    premises.forEach(function(premis){
        let thisProp = Number(premis.probability);
        prob = prob * (thisProp / 100);
    });

    prob = Math.floor(prob * 100);

    return prob;
}