CREATE
//"Prisoners should get rehabilitation" back by argument group
  (arg1:ArgGroup {probability : 100})-[:UsedFor]->(prisoners:Claim {text: "Prisoners should get rehabilitation", axiom : true, probability : 100}),
  //3 claims used in the argument group
(cost:Claim {text: "The cost of rehabilitation is less than the cost of prison", axiom : true, probability : 100})-[:UsedIn]->(arg1),
(lowestBest:Claim {text: "The lowest cost option is best", axiom : true, probability : 100})-[:UsedIn]->(arg1),
(binaryClaim:Claim {text: "There is only a choice between prison or rehab", axiom : true, probability : 100})-[:UsedIn]->(arg1),

(:Claim {text: "Lowering cost improves economy", axiom : true, probability : 100})-[:UsedIn]->(arg8:ArgGroup {probability : 100}),
(:Claim {text: "Improved economy is good", axiom : true, probability : 100})-[:UsedIn]->(arg8),
(arg8)-[:UsedFor]->(lowestBest),

(:Claim {text: "High costs improve money flow", axiom : true, probability : 100})-[:UsedIn]->(arg9:ArgGroup {probability : 100}),
(:Claim {text: "Money flow improves the economy", axiom : true, probability : 100})-[:UsedIn]->(arg9),
(arg9)-[:UsedFor]->(lowestBest),

  //two exmaples of claims that can not be true if the claim they have an "opposingPoint" link to is also true
(alt1:Claim {text: "It is possible to execute prisoners", axiom : true, probability : 100}),
(arg10:ArgGroup {probability : 50})-[:OpposingPoints]->(alt1),
(arg10)-[:OpposingPoints]->(binaryClaim),
(releasePrisoners:Claim {text: "It is possible to release prisoners", axiom : true, probability : 100})-[:OpposingPoints]->(binaryClaim),
(arg11:ArgGroup {probability : 50})-[:OpposingPoints]->(releasePrisoners),
(arg11)-[:OpposingPoints]->(binaryClaim),
//opposing point to an opposing point
(CantRelease:Claim {text: "Releasing prisoners is not an option for society", axiom : true, probability : 100})-[releasingPrisonersPossibility:OpposingPoints]->(releasePrisoners),
//opposing link. This does not disagree with either of the opposing points but says the link is erroneous
//(:Claim {text: "What is possible and what is an acceptable option for society are different", axiom : true, probability : 100})-[:OpposeLink]->(releasingPrisonersPossibility),
//the above claim doe snot work because it links to the realtionship to say that the relationship is false. you cannot link to relationships in Neo4J,
//it looks like. So instead we might create a node for thnks like 'OpposingPoints' that allow us to link to them. SO isntead of:
// A-B the link will look like A-0-B with 0 representing a special node whose purpose is to represent the link/relationship

//argument group
(arg5:ArgGroup {probability : 100})-[:UsedFor]->(CantRelease),
(:Claim {text: "Commiting crimes is unacceptable in society", axiom : true, probability : 100})-[:UsedIn]->(arg5),
(:Claim {text: "There is a high chance a criminal will commit a crime again if nothing changes in their situation", axiom : true, probability : 100})-[:UsedIn]->(arg5),
  
 //the user relises their point is valid for the 'spirit' of the argument that rehab or prison is only option but only if the intial
 //claim of prisoners 'should' is based on what is good for society which is not specified. The user rewords it and copies links
  
  //a new altered version of original claim that now needs a new altered argument group
   (arg6:ArgGroup {probability : 100})-[:UsedFor]->(prisonersExpanded:Claim {text: "Prisoners should get rehabilitation for the good of society", axiom : true, probability : 100}),
//the argument group uses the same claims accept for a new worded version of the binary option one
(cost)-[:UsedIn]->(arg6),
(lowestBest)-[:UsedIn]->(arg6),
//this one is also explianed with argument group
(expandedBinaryClaim:Claim {text: "There is only a choice between prison or rehab when considering whats best for society", axiom : true, probability : 100})-[:UsedIn]->(arg6),
  //the arg group followed by its claims
  (arg7:ArgGroup {probability : 100})-[:UsedFor]->(expandedBinaryClaim),
  (CantRelease)-[:UsedIn]->(arg7),
  (:Claim {text: "Executing prisoners is immoral", axiom : true, probability : 100})-[:UsedIn]->(arg7)
  
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
