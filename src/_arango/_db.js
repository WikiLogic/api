/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 */
Database = require('arangojs').Database;

const host = process.env.ARANGODB_HOST || "arango";
const port = process.env.ARANGODB_PORT || "8529";
const database = process.env.ARANGODB_DB;
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
console.log("Using database", database);

const db = new Database({
  url: `http://${username}:${password}@${host}:${port}`,
  databaseName: database
});

function createCollections(){
    console.log('1');
    var usersCollection = db.collection('users');
    console.log('2');
    var claimsCollection = db.collection('claims');
    console.log('3');
    var argumentsCollection = db.collection('arguments');
    console.log('4');
    var premisLinkCollection = db.edgeCollection('premisLinks');
    console.log('5');
    return Prmoise.all(
        usersCollection.create(),
        argumentsCollection.create(),
        premisLinkCollection.create(),
        claimsCollection.create(),
        claimsCollection.createFulltextIndex('text')
    );
}

function getUserCollection(){
    return db.collection('users');
}

function getClaimCollection(){
    return db.collection('claims');
}

function getArgumentCollection(){
    return db.collection('arguments');
}

function getPremisLinkCollection(){
    return db.edgeCollection('premisLinks');
}


module.exports = {
    db:db,
    createCollections: createCollections,
    getUserCollection: getUserCollection,
    getClaimCollection: getClaimCollection,
    getArgumentCollection: getArgumentCollection,
    getPremisLinkCollection: getPremisLinkCollection
}