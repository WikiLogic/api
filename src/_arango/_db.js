/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 */
Database = require('arangojs').Database;
db = new Database(process.env.ARANGO_URL || 'http://arango:8529');
ready = false;
var database_name = "wl_dev";
var usersCollection;

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
                },(err) => {
                    reject(error);
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
}

function getUserCollectoin(){
    if (!ready) { return false; }
    return db.collection('users');
}

module.exports = {
    init: initDbConnection,
    getUserCollectoin: getUserCollectoin
}