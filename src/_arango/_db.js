/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 */
Database = require('arangojs').Database;
db = new Database(process.env.ARANGO_URL || 'http://arango:8529');
var usersCollection;

ready = false;
var database_name = "wl_dev";

function initDbConnection(){
    return new Promise(function (resolve, reject) {
        db.listDatabases()
        .then((names) => {
            console.log("names: ", names);
            if (names.indexOf(database_name) > -1){
                db.useDatabase(database_name);
                initDbCollections();
                db.get().then(()=> {
                    ready = true;
                    resolve(database_name);
                }).catch((err) => {
                    console.log("db init error", err);
                    reject(err);
                });
            } else {
                db.createDatabase(database_name).then(() => {
                    db.useDatabase(database_name);
                    initDbCollections();
                    ready = true;
                    resolve(database_name);
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
    argumentsCollection = db.collection('arguments');
    argumentsCollection.create();

    premisLinkCollection = db.edgeCollection('premisLinks');
    premisLinkCollection.create();
}

function getUserCollection(){
    if (!ready) { initDbConnection(); }
    return db.collection('users');
}

function getClaimCollection(){
    if (!ready) { initDbConnection(); }
    return db.collection('claims');
}

function getArgumentCollection(){
    if (!ready) { initDbConnection(); }
    return db.collection('arguments');
}

function getPremisLinkCollection(){
    if (!ready) { initDbConnection(); }
    return db.collection('premisLinks');
}

function getAllUsers(){
    return db.database(database_name).then((wlDb) => {
        return wlDb.query(`FOR doc IN users RETURN doc`);
    }).then((cursor) => {
        return cursor.all();
    }).catch((err) => {
        conole.log("get all users error", err);
    })
}

function getUserByUsername(username){
    return db.database(database_name).then((wlDb) => {
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

function getHealth(){
    if (!ready) { 
        initDbConnection();
    }

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
    getUserByUsername: getUserByUsername
}