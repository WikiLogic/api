"use strict";

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:neo4j@localhost:7474');

/**
 * An error handler for when the db failes in some way,
 * Log the fail
 * @param {string} message 
 */
function failed(message){

}

module.exports = {
    db:db,
    failed:failed
};