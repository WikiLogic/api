var Arango = require("../_arango/_db");

module.exports = function(text){
    return new Promise(function (resolve, reject) {
        Arango.db.query(`
            FOR doc IN claims 
                FILTER doc.text == "${text}"
                RETURN doc
            `).then((cursor) => {

                cursor.all().then((data) => {
                    resolve(data);
                }).catch((err) => {
                    reject(err);
                });

            }).catch((err) => {
                reject(err);
            });
    });
}