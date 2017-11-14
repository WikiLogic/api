/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 */
ArangoDatabase = require('arangojs').Database;

const host = process.env.ARANGODB_HOST || "arango";
const port = process.env.ARANGODB_PORT || "8529";
const database = process.env.ARANGODB_DB || "wl_dev";
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
const db = new ArangoDatabase(`http://${username}:${password}@${host}:${port}`);

function setUpDatabase(){

    return new Promise(function (resolve, reject) {
        db.listDatabases().then((listOfDatabases) => {
            //returns an array of strings with the names of each db.
            if (listOfDatabases.includes(database)) {
                db.useDatabase(database);
                resolve('using ' + database);
                console.log('Database is up and running as expected, using ' + database);
                return false;
            } else {
                return db.createDatabase(database)
            }
        }).then((meta) => {
            if (!meta) { return false; }

            console.log('New database created: ', meta);
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
            if (!meta) { return false; }
            console.log('Collections added to new database: ', meta);
            resolve(meta);
        }).catch((err) => {
            
            switch (err.message) {
                case 'Service Unavailable':
                    console.log('Service Unavailable - guessing the database container hasn\'t started yet');
                    dbMIA = true;
                    break;
                case 'duplicate name':
                    console.log('The database already exists but we\'re not using it... setting useDatabase again');
                    db.useDatabase(database);
                    break;
                case 'operation only allowed in system database':
                    console.log('Hmmmmmmmmm something to do with the system db');
                    break;
                default:

                    switch (err.code) {
                        case 'ECONNREFUSED':
                            console.log('I believe the database is still setting itself up');
                            break;
                        default:
                            console.log('oh oh. Don\'t know what this error is: ', err.message);
                    }
            }

            reject({
                err: err.message,
                database: database
            });
        });
    });
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


setUpDatabase();

module.exports = {
    db:db,
    setup: setUpDatabase,
    getUserCollection: getUserCollection,
    getClaimCollection: getClaimCollection,
    getArgumentCollection: getArgumentCollection,
    getPremisLinkCollection: getPremisLinkCollection
}