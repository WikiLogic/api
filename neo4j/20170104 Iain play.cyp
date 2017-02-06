//http://prntscr.com/drkvlg

CREATE
(claimOriginal:Claim {body:  "Prisoners should get rehabilitation", state:false}),
    //"Prisoners should get rehabilitation" back by argument group
    (argForRehab:ArgGroup {state:true})-[:SUPPORTS]->(claimOriginal),
        //3 claims used in the argument group
        (claimRehabIsCheap:Claim {body: "The cost of rehabilitation is less than the cost of prison", state:true})-[:USED_IN]->(argForRehab),
        (claimCheapIsGood:Claim {body: "The lowest cost option is best", state:true})-[:USED_IN]->(argForRehab),
        (binaryClaim:Claim {body: "There is only a choice between prison or rehab", state:false})-[:USED_IN]->(argForRehab),

    (argAgainstBinary:ArgGroup {state:true})-[:OPPOSES]->(binaryClaim),
        (claimExecutionIsPossible:Claim {body: "It is possible to execute prisoners", state:true})-[:USED_IN]->(argAgainstBinary),
        (claimReleaseIsPossible:Claim {body: "It is possible to release prisoners", state:true})-[:USED_IN]->(argAgainstBinary),

    (argAgainstPossibleRelease:ArgGroup {state:true})-[:OPPOSES]->(claimReleaseIsPossible),
        (claimCannotRelease:Claim {body: "Releasing prisoners is not an option for society", state:true})-[:USED_IN]->(argAgainstPossibleRelease),

    (argAgainstNoRelease:ArgGroup {status: true})-[:OPPOSES]->(claimCannotRelease),
        (:Claim {body: "Commiting crimes is unacceptable in society", state:true})-[:USED_IN]->(argAgainstNoRelease),
        (:Claim {body: "There is a high chance a criminal will commit a crime again if nothing changes in their situation", state:true})-[:USED_IN]->(argAgainstNoRelease),

(claimModified:Claim {body: "Prisoners should get rehabilitation for the good of society", state:true}),
    (argAgainstModifiedRehab:ArgGroup {status: true})-[:OPPOSES]->(claimModified),
        (claimRehabIsCheap)-[:USED_IN]->(argAgainstModifiedRehab),
        (claimCheapIsGood)-[:USED_IN]->(argAgainstModifiedRehab),
        (expandedBinaryClaim:Claim {body: "There is only a choice between prison or rehab when considering whats best for society", state:true})-[:USED_IN]->(argAgainstModifiedRehab),

    (argAgainstNewBinary:ArgGroup {status: false})-[:OPPOSES]->(expandedBinaryClaim),
        (CantRelease)-[:USED_IN]->(argAgainstNewBinary),
        (:Claim {body: "Executing prisoners is immoral", state:true})-[:USED_IN]->(argAgainstNewBinary),

//mutually exclusive groups...
(claimFlatEarth:Claim {body:"The Earth is flat", status:false}),
(claimSphericalEarth:Claim {body:"The Earth is spherical", status:false}),
(claimConicalEarth:Claim {body:"The Earth is a cone", status:true}),
    (earthExclusive:MutualExclusionGroup),
        (earthExclusive)-[:MUTUAL_EXCLUSION_LINK]->(claimFlatEarth),
        (earthExclusive)-[:MUTUAL_EXCLUSION_LINK]->(claimSphericalEarth),
        (earthExclusive)-[:MUTUAL_EXCLUSION_LINK]->(claimConicalEarth),

//or mutually exclusive relationship?
(claimNorthNegative:Claim {body:"The North Pole has a negative charge", state:true}),
(claimNorthPositive:Claim {body:"The North Pole has a positive charge", state:false}),
    (claimNorthNegative)-[:MUTUALLY_EXCLUDES]->(claimNorthPositive);

  //display the magic!
  //match (n) return (n)limit 100


//want a claim that has multiple arguments each with multiple claims
CREATE
    (claimLearnJsFirst:Claim {body: "Javascript should be the first language people learn", stats: true}),
        (argForLearningJsFirst:ArgGroup {state: true})-[:SUPPORTS]->(claimLearnJsFirst),
            (claimOriginal:Claim {body:  "Javascript is the best language", state:false})-[:USED_IN]->(argForLearningJsFirst),
                (argForJS:ArgGroup {state:true})-[:SUPPORTS]->(claimOriginal),
                    (claimBestIsDefined:Claim {body: "The best language is the one with the most number of users", state:true})-[:USED_IN]->(argForJS),
                    (claimJsHasTheMost:Claim {body: "Javascript has the most number of users", state:true})-[:USED_IN]->(argForJS),
                (argAgainstJS:ArgGroup {state:true})-[:OPPOSES]->(claimOriginal),
                    (claimStrongIsBetter:Claim {body: "Strongly typed languages are better than loosley typed languages", state:true})-[:USED_IN]->(argAgainstJS),
                    (claimJsIsLose:Claim {body: "Javascript is a loosley typed language", state:true})-[:USED_IN]->(argAgainstJS),
                    (claimStrongExists:Claim {body: "Strongly typed languages exist", state:true})-[:USED_IN]->(argAgainstJS),
            (claimLearbBestFirst:Claim {body: "People should learn the best language first", state: false})-[:USED_IN]->(argForLearningJsFirst),
        (argForJsFirst2:ArgGroup {state: true})-[:SUPPORTS]->(claimLearnJsFirst),
            (claimJsIsEasiest:Claim {body: "Javascript is the easiest language", state: false})-[:USED_IN]->(argForJsFirst2),
            (claimLearnEasiestFirst:Claim {body: "People should learn the easiest language first", state: true})-[:USED_IN]->(argForJsFirst2);

//clear out DB
MATCH (n) DETACH
DELETE n

//test data - claim000 has 2 for args, 2 against args and is used in 1 supporting argument and 1 opposing argument
CREATE
(claim000:Claim {body:"0", state:50}),
    //agruments for
    (arg0:ArgGroup {state:50})-[:SUPPORTS]->(claim000),
        (claim001:Claim {body:"1", state:50})-[:USED_IN]->(arg0),
        (claim002:Claim {body:"2", state:50})-[:USED_IN]->(arg0),
        (claim003:Claim {body:"3", state:50})-[:USED_IN]->(arg0),
    (arg1:ArgGroup {state:50})-[:SUPPORTS]->(claim000),
        (claim004:Claim {body:"4", state:50})-[:USED_IN]->(arg1),
        (claim005:Claim {body:"5", state:50})-[:USED_IN]->(arg1),
        (claim006:Claim {body:"6", state:50})-[:USED_IN]->(arg1),
    //arguments against
    (arg2:ArgGroup {state:50})-[:OPPOSES]->(claim000),
        (claim007:Claim {body:"7", state:50})-[:USED_IN]->(arg2),
        (claim008:Claim {body:"8", state:50})-[:USED_IN]->(arg2),
        (claim009:Claim {body:"9", state:50})-[:USED_IN]->(arg2),
    (arg3:ArgGroup {state:50})-[:OPPOSES]->(claim000),
        (claim010:Claim {body:"10", state:50})-[:USED_IN]->(arg3),
        (claim011:Claim {body:"11", state:50})-[:USED_IN]->(arg3),
        (claim012:Claim {body:"12", state:50})-[:USED_IN]->(arg3),

    //1 supporting 
    (claim019: Claim {body:"19", state:50}),
        (arg4:ArgGroup {state:50})-[:SUPPORTS]->(claim019),
            (claim000)-[:USED_IN]->(arg4),
            (claim013: Claim {body:"13", state:50})-[:USED_IN]->(arg4),
            (claim014: Claim {body:"14", state:50})-[:USED_IN]->(arg4),
            (claim015: Claim {body:"15", state:50})-[:USED_IN]->(arg4),
    //1 opposing
    (claim020: Claim {body:"20", state:50}),
        (arg5:ArgGroup {state:50})-[:OPPOSES]->(claim020),
            (claim000)-[:USED_IN]->(arg5),
            (claim016: Claim {body:"16", state:50})-[:USED_IN]->(arg5),
            (claim017: Claim {body:"17", state:50})-[:USED_IN]->(arg5),
            (claim018: Claim {body:"18", state:50})-[:USED_IN]->(arg5);

