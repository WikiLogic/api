/**
 * Works out the probability of a claim
 * Gets an average of all the opposition / support separately <---- this feels like a weak spot, large amounts of spam will draw it down. So - add a streangth number?
 * Do the baysean thing (I think)
 * Return the ratio
 * @param {array} args - all the args that support / oppose the claim in question
 */
module.exports = function getTheRatioBetweenOpposesAndSupports(args){
    if (args.length === 0) { return 0; }
    var supportProb = 0; var supportCount = 0;
    var opposeProb = 0; var opposeCount = 0;
    
    args.forEach(function(arg){
        if (arg.type === "AGAINST") {
            //invert opposition
            opposeProb += arg.probability;
            opposeCount++;
        } else {
            supportProb += arg.probability;
            supportCount++;
        }
    });

    //get an average for each type
    opposeProb = opposeProb / opposeCount;
    supportProb = supportProb / supportCount;

    /* eg - support: 0.2, oppose: 0.1        <-- the average values from just above
                    /   \          \
                0.1     0.1        0.1
                      2 (in support)         <-- the supportProb
                     over
                      3 (total posabilities) <-- var divider = supportProb + opposeProb
                      0.666...
    */

    var divider = supportProb + opposeProb;
    var result = supportProb / divider;

    return result;
}
