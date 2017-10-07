/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 */
Database = require('arangojs').Database;
db = new Database(process.env.ARANGO_URL || 'http://arango:8529');
var usersCollection;

var DB_NAME = "wl_dev";

function initDbConnection(){
    return new Promise(function (resolve, reject) {
        db.listDatabases()
        .then((names) => {
            if (names.indexOf(DB_NAME) > -1){
                db.useDatabase(DB_NAME);
                initDbCollections();
                resolve(DB_NAME);
            } else {
                db.createDatabase(DB_NAME).then(() => {
                    db.useDatabase(DB_NAME);
                    initDbCollections();
                    resolve(DB_NAME);
                },(err) => {
                    reject(error)
                });
            }
        }).catch((err) => {
            console.log("db error", err);
            reject(error);
        });
    });
}

function initDbCollections(){
    usersCollection = db.collection('users');
    usersCollection.create();
    
    claimsCollection = db.collection('claims');
    claimsCollection.create();
    claimsCollection.createFulltextIndex('text');

    argumentsCollection = db.collection('arguments');
    argumentsCollection.create();

    premisLinkCollection = db.edgeCollection('premisLinks');
    premisLinkCollection.create();
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

function getAllUsers(){
    return db.database(DB_NAME).then((wlDb) => {
        return wlDb.query(`FOR doc IN users RETURN doc`);
    }).then((cursor) => {
        return cursor.all();
    }).catch((err) => {
        conole.log("get all users error", err);
    })
}

function getUserByUsername(username){
    return db.database(DB_NAME).then((wlDb) => {
        return wlDb.query(`
            FOR doc IN users 
            FILTER doc.name == "${username}" 
            RETURN doc`);
    }).then((cursor) => {
        return cursor.all();
    }).catch((err) => {
        console.log('get by username errr', err);
    })
}

function listAllCollections(){
    return new Promise(function (resolve, reject) {
        db.listCollections().then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getCollectionCount(collection){
    return new Promise((resolve, reject) => {
        db.query(`RETURN LENGTH(${collection})`).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        })
    });
}

function getHealth(){
    return new Promise(function (resolve, reject) {
        db.listCollections().then((data) => {
            resolve({
                arangoHealth: data
            });
        }).catch((err) => {
            reject({
                arangoErr: err
            });
        });
    });
}

module.exports = {
    db:db,
    init: initDbConnection,
    getUserCollection: getUserCollection,
    getClaimCollection: getClaimCollection,
    getArgumentCollection: getArgumentCollection,
    getPremisLinkCollection: getPremisLinkCollection,
    listAllCollections: listAllCollections,
    getHealth: getHealth,
    getAllUsers: getAllUsers,
    getUserByUsername: getUserByUsername,
    getCollectionCount: getCollectionCount
}