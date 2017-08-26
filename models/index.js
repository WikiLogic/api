Database = require('arangojs').Database;

db = new Database(process.env.ARANGO_URL || 'http://arango:8529');

console.log("db", db);