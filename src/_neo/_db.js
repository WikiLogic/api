"use strict";

//https://github.com/aseemk/node-neo4j-template/blob/master/models/user.js
//looks like a good example of how to use thie neo4j package in a better way :)

var neo4j = require('neo4j');
// 'http://neo4j:neo5j@localhost:7474' 
var db = new neo4j.GraphDatabase({
    url: process.env.NEO4J_URL ||'http://neo4j:neo5j@db:7474'
});


function getHealth(message){
    return new Promise((resolve, reject) => {
        db.cypher({
            query: "MATCH (n) RETURN count(*)"
        }, function (err, results) {
            if (err) {
                reject({
                    neoErr: err
                });
            }
            resolve({
                neoHealth: results
            });
        });
    })
}

module.exports = {
    db:db,
    getHealth:getHealth
};