CREATE
//"Prisoners should get rehabilitation" back by argument group
  (arg1:ArgGroup {status: false})-[:UsedFor]->(prisoners:Claim {text: "Prisoners should get rehabilitation"}),
  //3 claims used in the argument group
(cost:Claim {text: "The cost of rehabilitation is less than the cost of prison"})-[:UsedIn]->(arg1),
(lowestBest:Claim {text: "The lowest cost option is best"})-[:UsedIn]->(arg1),
(binaryClaim:Claim {text: "There is only a choice between prison or rehab"})-[:UsedIn]->(arg1),

(:Claim {text: "Lowering cost improves economy"})-[:UsedIn]->(arg8:ArgGroup),
(:Claim {text: "Improved economy is good"})-[:UsedIn]->(arg8),
(arg8)-[:UsedFor]->(lowestBest),

(:Claim {text: "High costs improve money flow"})-[:UsedIn]->(arg9:ArgGroup),
(:Claim {text: "Money flow improves the economy"})-[:UsedIn]->(arg9),
(arg9)-[:UsedFor]->(lowestBest),

  //two exmaples of claims that can not be true if the claim they have an "opposingPoint" link to is also true
(:Claim {text: "It is possible to execute prisoners"})-[:OpposingPoints]->(binaryClaim),
(releasePrisoners:Claim {text: "It is possible to release prisoners"})-[:OpposingPoints]->(binaryClaim),
//opposing point to an opposing point
(CantRelease:Claim {text: "Releasing prisoners is not an option for society"})-[releasingPrisonersPossibility:OpposingPoints]->(releasePrisoners),
//opposing link. This does not disagree with either of the opposing points but says the link is erroneous
//(:Claim {text: "What is possible and what is an acceptable option for society are different"})-[:OpposeLink]->(releasingPrisonersPossibility),
//the above claim doe snot work because it links to the realtionship to say that the relationship is false. you cannot link to relationships in Neo4J,
//it looks like. So instead we might create a node for thnks like 'OpposingPoints' that allow us to link to them. SO isntead of:
// A-B the link will look like A-0-B with 0 representing a special node whose purpose is to represent the link/relationship

//argument group
(arg5:ArgGroup {status: true})-[:UsedFor]->(CantRelease),
(:Claim {text: "Commiting crimes is unacceptable in society"})-[:UsedIn]->(arg5),
(:Claim {text: "There is a high chance a criminal will commit a crime again if nothing changes in their situation"})-[:UsedIn]->(arg5),
  
 //the user relises their point is valid for the 'spirit' of the argument that rehab or prison is only option but only if the intial
 //claim of prisoners 'should' is based on what is good for society which is not specified. The user rewords it and copies links
  
  //a new altered version of original claim that now needs a new altered argument group
   (arg6:ArgGroup {status: false})-[:UsedFor]->(prisonersExpanded:Claim {text: "Prisoners should get rehabilitation for the good of society"}),
//the argument group uses the same claims accept for a new worded version of the binary option one
(cost)-[:UsedIn]->(arg6),
(lowestBest)-[:UsedIn]->(arg6),
//this one is also explianed with argument group
(expandedBinaryClaim:Claim {text: "There is only a choice between prison or rehab when considering whats best for society"})-[:UsedIn]->(arg6),
  //the arg group followed by its claims
  (arg7:ArgGroup {status: false})-[:UsedFor]->(expandedBinaryClaim),
  (CantRelease)-[:UsedIn]->(arg7),
  (:Claim {text: "Executing prisoners is immoral"})-[:UsedIn]->(arg7)
  
  //display the magic!
  //match (n) return (n)limit 100


http://stackoverflow.com/questions/41780737/neo4j-return-a-node-with-an-array-of-nodes-as-propery-or-seperate-array

match (claim:Claim)-[:UsedIn]->(argGroup:ArgGroup)
WHERE (argGroup)-->(:Claim {text: "Prisoners should get rehabilitation"})
with argGroup, collect({ id: id(claim), text: claim.text, type: labels(claim)[0] }) as nodes
with { id: id(argGroup), text: argGroup.text, type: labels(argGroup)[0], SubNodes: nodes } as containerNode
return {nodes: collect(containerNode) }

match (claim:Claim)-[:UsedIn]->(argGroup:ArgGroup)
WHERE (argGroup)-->(:Claim {text: "Prisoners should get rehabilitation"})
with argGroup, collect({ id: id(claim), text: claim.text, type: labels(claim)[0] }) as nodes
with { id: id(argGroup), text: argGroup.text, type: labels(argGroup)[0], SubNodes: nodes } as containerNode
return {nodes: collect(containerNode) }



MATCH (claim:Claim)-[:USED_IN]->(argGroup:ArgGroup)
                   (argGroup)-->(:Claim {text: "Prisoners should get rehabilitation"})
                   with argGroup, collect({ id: id(claim), text: claim.text, type: labels(claim)[0] }) as nodes
                   with { id: id(argGroup), text: argGroup.text, type: labels(argGroup)[0], SubNodes: nodes } as containerNode
                   RETURN {nodes: collect(containerNode) }
