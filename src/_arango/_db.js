/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 */
Database = require('arangojs').Database;

const host = process.env.ARANGODB_HOST || "arango";
const port = process.env.ARANGODB_PORT || "8529";
const database = process.env.ARANGODB_DB || "wl_dev";
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
console.log("Using database", database);

const db = new Database(`http://${username}:${password}@${host}:${port}`);

db.createDatabase(database).then((meta) => {
    console.log('I hope that worked - lets try and make some collections now');
    var usersCollection = db.collection('users');
    var claimsCollection = db.collection('claims');
    var argumentsCollection = db.collection('arguments');
    var premisLinkCollection = db.edgeCollection('premisLinks');
    return Promise.all([
        usersCollection.create(),
        argumentsCollection.create(),
        premisLinkCollection.create(),
        claimsCollection.create(),
        claimsCollection.createFulltextIndex('text')
    ]);
}).then((meta) => {
    console.log('fingers crossed the collections now exist!');
}).catch((err) => {
    console.log('I hope it already existed');
});


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
    getUserCollection: getUserCollection,
    getClaimCollection: getClaimCollection,
    getArgumentCollection: getArgumentCollection,
    getPremisLinkCollection: getPremisLinkCollection
}