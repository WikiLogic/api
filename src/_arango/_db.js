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

const db = new Database({
  url: `http://${username}:${password}@${host}:${port}`,
  databaseName: database
});

function setup(){
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
}

db.listCollections().then((data) => {
    // if (data.length < 5) {
        setup().then((data) => {
            console.log('collection set up complete', data);
        }).catch((err) => {
            //TODO: fix this
            console.log('collection set up error (probably just dup collection names as they already exist. Not to worry, on the todo to fix)');
        });
    // }
}).catch((err) => {
    console.log('list collections error: ', err);
});
//does the db have a text index?


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
    setup: setup,
    getUserCollection: getUserCollection,
    getClaimCollection: getClaimCollection,
    getArgumentCollection: getArgumentCollection,
    getPremisLinkCollection: getPremisLinkCollection
}