/**
 * This file connects to the DB
 * Collection objects are created here and exposed to the model controllers to ineract with
 * TODO: move all business db interactions into here.
 *
 * https://github.com/arangodb/arangojs/blob/master/docs/Drivers/JS/Reference/README.md#collectioncreate
 */
var arangojs = require("arangojs");

const host = process.env.ARANGODB_HOST || "arango";
const port = process.env.ARANGODB_PORT || "8529";
const DB_NAME = process.env.ARANGODB_DB || "wl_dev";
const username = process.env.ARANGODB_USERNAME;
const password = process.env.ARANGODB_PASSWORD;
const DB_URL = `http://${host}:${port}`;
// const db = new ArangoDatabase(`http://${username}:${password}@${host}:${port}`);
const db = new arangojs.Database({
  url: DB_URL
});
var setupCount = 0;

/**
 * If there isn't a db and we have to make a new one,
 * it'll need some collections.
 * TODO: probably move a check and creation for each collection
 * into the collection specific code. Maybe?
 */
async function setUpCollections() {
  let usersCollection = db.collection("users");
  await usersCollection.create();
  let claimsCollection = db.collection("claims");
  await claimsCollection.create();
  await claimsCollection.createFulltextIndex("text");
  let argumentsCollection = db.collection("arguments");
  await argumentsCollection.create();
  let premisLinkCollection = db.edgeCollection("premisLinks");
  await premisLinkCollection.create();
  //index
  return {
    usersCollection,
    claimsCollection,
    argumentsCollection,
    premisLinkCollection
  };
}

/**
 * We don't yet know if a db exists.
 * So if it doesn't, set one up!
 * The goal is to have a valid db connection up and running by the time we return
 */
async function initDb() {
  try {
    let dbNames = await db.listDatabases();
    let dbInfo;

    //get the db connection up and running
    if (dbNames.indexOf(DB_NAME) > -1) {
      db.useDatabase(DB_NAME);
      dbInfo = await db.get();
    } else {
      dbInfo = await db.createDatabase(DB_NAME);
      console.log("New database set up.");
    }

    //check the collections are all there
    let collectionInfo = await db.listCollections();
    if (collectionInfo.length == 0) {
      let collections = await setUpCollections();
      collectionInfo = await db.listCollections();
      console.log("New collections set up.");
    }

    console.log("Connected to database: ", dbInfo);
  } catch (err) {
    dbConnectionErrorHandler(err);
  }
}

/**
 * Sometimes there will be an error.
 * As they happen and we figure out what they mean
 * add them here with helpful error messages.
 * And if there's an automated way to fix the problem,
 * try adding that too.
 * The goal here is to help new (or even existing!) developers as much as we possibly can.
 */
function dbConnectionErrorHandler(err) {
  switch (err.message) {
    case "Unauthorized":
      console.log(
        "Unauthorized: check the database credentials in your docker-compose file, the arango service and the api service should both have the same"
      );
      break;
    case "Service Unavailable":
      console.log(
        "Service Unavailable: guessing the database container hasn't started yet. Will try again in a second!"
      );
      setTimeout(initDb, 1000);
      break;
    case "duplicate name":
      console.log(
        "Duplicate name: The database already exists but we're not using it... setting useDatabase again"
      );
      db.useDatabase(DB_NAME);
      break;
    case "operation only allowed in system database":
      console.log("Hmmmmmmmmm something to do with the system db");
      break;
    case "collection not found":
      console.log(
        "Collection not found: Seems the db was only half sort of set up - trying again!"
      );
      setTimeout(initDb, 100);
      break;
    default:
      switch (err.code) {
        case "ECONNREFUSED":
          console.log(
            "ECONNREFUSED: API's DB connection was refused. This usually means the database container isn't ready yet - will try again in a sec!"
          );
          setTimeout(initDb, 1000);
          break;
        case "ENOTFOUND":
          console.log(
            "ENOTFOUND: API can't connect to the DB address, it's not there. Did you expose the port? is the DB running?"
          );
          break;
        default:
          console.log("oh oh. Don't know what this error is: ", err.message);
      }
  }
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

initDb();

module.exports = {
  db: db,
  getUserCollection: getUserCollection,
  getClaimCollection: getClaimCollection,
  getArgumentCollection: getArgumentCollection,
  getPremisLinkCollection: getPremisLinkCollection
};
