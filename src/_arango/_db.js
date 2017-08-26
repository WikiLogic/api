Database = require('arangojs').Database;
db = new Database(process.env.ARANGO_URL || 'http://arango:8529');

var database_name = "wl_dev";
var usersCollection, nodesCollection;

function initDbConnection(){
    db.listDatabases()
    .then((names) => {
        if (names.indexOf(database_name) > -1){
            db.useDatabase(database_name);
            initDbCollections();
            db.get().then(
                ()=> console.log("Using database "+database_name),
                error=> console.error("Error connecting to database: "+error)
            );
        } else {
            db.createDatabase(database_name).then(
                () => {
                    console.log("Database created successfully: "+database_name);
                    db.useDatabase(database_name);
                    initDbCollections();
                },
                error=> console.error("Error creating database: "+error)
            );
        }
    });
}

function initDbCollections(){
    usersCollection = db.collection('users');
    nodesCollection = db.collection('nodes');
}

function get(collection){

}

function set(collection, id){

}

module.exports = {
    get,
    set
}