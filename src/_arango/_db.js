/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 * TODO: move all business db interactions into here.
 */
ArangoDatabase = require("arangojs").Database;

const host = process.env.ARANGODB_HOST || "arango";
const port = process.env.ARANGODB_PORT || "8529";
const database = process.env.ARANGODB_DB || "wl_dev";
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
const db = new ArangoDatabase(`http://${username}:${password}@${host}:${port}`);
var setupCount = 0;

function setUpDatabase() {
  setupCount++;
  console.log("Setting up database with credentials: ", username, password);
  return new Promise(function(resolve, reject) {
    if (setupCount > 5) {
      reject({
        err: "Too many DB set up runs. Something's not right",
        database: database
      });
    }
    db
      .listDatabases()
      .then(listOfDatabases => {
        //returns an array of strings with the names of each db.
        if (listOfDatabases.includes(database)) {
          db.useDatabase(database);
          resolve("using " + database);
          console.log(
            "Database is up and running as expected, using " + database
          );
          return false;
        } else {
          return db.createDatabase(database);
        }
      })
      .then(meta => {
        if (!meta) {
          return false;
        }

        console.log("New database created: ", meta);
        db.useDatabase(database);
        var usersCollection = db.collection("users");
        var claimsCollection = db.collection("claims");
        var argumentsCollection = db.collection("arguments");
        var premisLinkCollection = db.edgeCollection("premisLinks");
        return Promise.all([
          usersCollection.create(),
          argumentsCollection.create(),
          premisLinkCollection.create(),
          claimsCollection.create(),
          claimsCollection.createFulltextIndex("text")
        ]);
      })
      .then(meta => {
        if (!meta) {
          return false;
        }
        console.log("Collections added to new database: ", meta);
        resolve(meta);
      })
      .catch(err => {
        switch (err.message) {
          case "Unauthorized":
            console.log(
              "Unauthorized - check the database credentials in your docker-compose file, the arango service and the api service should both have the same"
            );
            break;
          case "Service Unavailable":
            console.log(
              "Service Unavailable - guessing the database container hasn't started yet. Will try again in a second!"
            );
            setTimeout(setUpDatabase, 1000);
            break;
          case "duplicate name":
            console.log(
              "The database already exists but we're not using it... setting useDatabase again"
            );
            db.useDatabase(database);
            break;
          case "operation only allowed in system database":
            console.log("Hmmmmmmmmm something to do with the system db");
            break;
          case "collection not found":
            console.log(
              "Seems the db was only half sort of set up - trying again!"
            );
            setTimeout(setUpDatabase, 100);
            break;
          default:
            switch (err.code) {
              case "ECONNREFUSED":
                console.log(
                  "This usually means the database container isn't ready yet - will try again in a sec!"
                );
                setTimeout(setUpDatabase, 1000);
                break;
              case "ENOTFOUND":
                console.log(
                  "Express app cannot connect to the address given for the DB. ENOTFOUND. Did you expose the port? is the DB running?"
                );
                break;
              default:
                console.log(
                  "oh oh. Don't know what this error is: ",
                  err.message
                );
            }
        }

        reject({
          err: err.message,
          database: database
        });
      });
  });
}

function getUserCollection() {
  return db.collection("users");
}

function getClaimCollection() {
  return db.collection("claims");
}

function getArgumentCollection() {
  return db.collection("arguments");
}

function getPremisLinkCollection() {
  return db.edgeCollection("premisLinks");
}

setUpDatabase();

module.exports = {
  db: db,
  setup: setUpDatabase,
  getUserCollection: getUserCollection,
  getClaimCollection: getClaimCollection,
  getArgumentCollection: getArgumentCollection,
  getPremisLinkCollection: getPremisLinkCollection
};
