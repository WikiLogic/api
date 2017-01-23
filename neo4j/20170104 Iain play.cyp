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
