//http://prntscr.com/drkvlg

CREATE
(claimOriginal:Claim {text:  "Prisoners should get rehabilitation", state:50}),
    //"Prisoners should get rehabilitation" back by argument group
    (argForRehab:ArgGroup {state:50})-[:SUPPORTS]->(claimOriginal),
        //3 claims used in the argument group
        (claimRehabIsCheap:Claim {text: "The cost of rehabilitation is less than the cost of prison", state:50})-[:USED_IN]->(argForRehab),
        (claimCheapIsGood:Claim {text: "The lowest cost option is best", state:50})-[:USED_IN]->(argForRehab),
        (binaryClaim:Claim {text: "There is only a choice between prison or rehab", state:50})-[:USED_IN]->(argForRehab),

    (argAgainstBinary:ArgGroup {state:50})-[:OPPOSES]->(binaryClaim),
        (claimExecutionIsPossible:Claim {text: "It is possible to execute prisoners", state:50})-[:USED_IN]->(argAgainstBinary),
        (claimReleaseIsPossible:Claim {text: "It is possible to release prisoners", state:50})-[:USED_IN]->(argAgainstBinary),

    (argAgainstPossibleRelease:ArgGroup {state:50})-[:OPPOSES]->(claimReleaseIsPossible),
        (claimCannotRelease:Claim {text: "Releasing prisoners is not an option for society", state:50})-[:USED_IN]->(argAgainstPossibleRelease),

    (argAgainstNoRelease:ArgGroup {state: 50})-[:OPPOSES]->(claimCannotRelease),
        (:Claim {text: "Commiting crimes is unacceptable in society", state:50})-[:USED_IN]->(argAgainstNoRelease),
        (:Claim {text: "There is a high chance a criminal will commit a crime again if nothing changes in their situation", state:50})-[:USED_IN]->(argAgainstNoRelease),

(claimModified:Claim {text: "Prisoners should get rehabilitation for the good of society", state:50}),
    (argAgainstModifiedRehab:ArgGroup {state: 50})-[:OPPOSES]->(claimModified),
        (claimRehabIsCheap)-[:USED_IN]->(argAgainstModifiedRehab),
        (claimCheapIsGood)-[:USED_IN]->(argAgainstModifiedRehab),
        (expandedBinaryClaim:Claim {text: "There is only a choice between prison or rehab when considering whats best for society", state:50})-[:USED_IN]->(argAgainstModifiedRehab),

    (argAgainstNewBinary:ArgGroup {statstateus: 50})-[:OPPOSES]->(expandedBinaryClaim),
        (CantRelease)-[:USED_IN]->(argAgainstNewBinary),
        (:Claim {text: "Executing prisoners is immoral", state:50})-[:USED_IN]->(argAgainstNewBinary),

//mutually exclusive groups...
(claimFlatEarth:Claim {text:"The Earth is flat", state:50}),
(claimSphericalEarth:Claim {text:"The Earth is spherical", state:50}),
(claimConicalEarth:Claim {text:"The Earth is a cone", state:50}),
    (earthExclusive:MutualExclusionGroup),
        (earthExclusive)-[:MUTUAL_EXCLUSION_LINK]->(claimFlatEarth),
        (earthExclusive)-[:MUTUAL_EXCLUSION_LINK]->(claimSphericalEarth),
        (earthExclusive)-[:MUTUAL_EXCLUSION_LINK]->(claimConicalEarth),

//or mutually exclusive relationship?
(claimNorthNegative:Claim {text:"The North Pole has a negative charge", state:50}),
(claimNorthPositive:Claim {text:"The North Pole has a positive charge", state:50}),
    (claimNorthNegative)-[:MUTUALLY_EXCLUDES]->(claimNorthPositive);

  //display the magic!
  //match (n) return (n)limit 100


//want a claim that has multiple arguments each with multiple claims
CREATE
    (claimLearnJsFirst:Claim {text: "Javascript should be the first language people learn", stats: 50}),
        (argForLearningJsFirst:ArgGroup {state: 50})-[:SUPPORTS]->(claimLearnJsFirst),
            (claimOriginal:Claim {text:  "Javascript is the best language", state:50})-[:USED_IN]->(argForLearningJsFirst),
                (argForJS:ArgGroup {state:50})-[:SUPPORTS]->(claimOriginal),
                    (claimBestIsDefined:Claim {text: "The best language is the one with the most number of users", state:50})-[:USED_IN]->(argForJS),
                    (claimJsHasTheMost:Claim {text: "Javascript has the most number of users", state:50})-[:USED_IN]->(argForJS),
                (argAgainstJS:ArgGroup {state:50})-[:OPPOSES]->(claimOriginal),
                    (claimStrongIsBetter:Claim {text: "Strongly typed languages are better than loosley typed languages", state:50})-[:USED_IN]->(argAgainstJS),
                    (claimJsIsLose:Axiom {text: "Javascript is a loosley typed language"})-[:USED_IN]->(argAgainstJS),
                    (claimStrongExists:Axiom {text: "Strongly typed languages exist"})-[:USED_IN]->(argAgainstJS),
            (claimLearbBestFirst:Claim {text: "People should learn the best language first", state: 50})-[:USED_IN]->(argForLearningJsFirst),
        (argForJsFirst2:ArgGroup {state: 50})-[:SUPPORTS]->(claimLearnJsFirst),
            (claimJsIsEasiest:Axiom {text: "Javascript is the easiest language"})-[:USED_IN]->(argForJsFirst2),
            (claimLearnEasiestFirst:Claim {text: "People should learn the easiest language first", state: 50})-[:USED_IN]->(argForJsFirst2);

//clear out DB
MATCH (n) DETACH
DELETE n

//test data - claim000 has 2 for args, 2 against args and is used in 1 supporting argument and 1 opposing argument
CREATE
(claim000:Claim {text:"zero", state:50}),
    //agruments for
    (arg0:ArgGroup {state:50})-[:SUPPORTS]->(claim000),
        (claim001:Claim {text:"one", state:50})-[:USED_IN]->(arg0),
        (claim002:Claim {text:"two", state:50})-[:USED_IN]->(arg0),
        (claim003:Axiom {text:"three"})-[:USED_IN]->(arg0),
    (arg1:ArgGroup {state:50})-[:SUPPORTS]->(claim000),
        (claim004:Claim {text:"four", state:50})-[:USED_IN]->(arg1),
        (claim005:Claim {text:"five", state:50})-[:USED_IN]->(arg1),
        (claim006:Axiom {text:"six"})-[:USED_IN]->(arg1),
    //arguments against
    (arg2:ArgGroup {state:50})-[:OPPOSES]->(claim000),
        (claim007:Claim {text:"seven", state:50})-[:USED_IN]->(arg2),
        (claim008:Claim {text:"eight", state:50})-[:USED_IN]->(arg2),
        (claim009:Axiom {text:"nine"})-[:USED_IN]->(arg2),
    (arg3:ArgGroup {state:50})-[:OPPOSES]->(claim000),
        (claim010:Claim {text:"ten", state:50})-[:USED_IN]->(arg3),
        (claim011:Claim {text:"eleven", state:50})-[:USED_IN]->(arg3),
        (claim012:Axiom {text:"twelve"})-[:USED_IN]->(arg3),

    //1 supporting 
    (claim019:Claim {text:"nineteen", state:50}),
        (arg4:ArgGroup {state:50})-[:SUPPORTS]->(claim019),
            (claim000)-[:USED_IN]->(arg4),
            (claim013:Claim {text:"thirteen", state:50})-[:USED_IN]->(arg4),
            (claim014:Claim {text:"fourteen", state:50})-[:USED_IN]->(arg4),
            (claim015:Axiom {text:"fifteen"})-[:USED_IN]->(arg4),
    //1 opposing
    (claim020:Claim {text:"twenty", state:50}),
        (arg5:ArgGroup {state:50})-[:OPPOSES]->(claim020),
            (claim000)-[:USED_IN]->(arg5),
            (claim016:Claim {text:"sixteen", state:50})-[:USED_IN]->(arg5),
            (claim017:Claim {text:"seventeen", state:50})-[:USED_IN]->(arg5),
            (claim018:Axiom {text:"eighteen"})-[:USED_IN]->(arg5);

