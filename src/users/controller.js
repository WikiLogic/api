var Arango = require('../_arango/_db');
var UserModel = {
    username: "username",
    email: "email",
    hash: "hash",
    signUpDate: "dateString"
}

function createUser(email, username, hash){
    var UsersCollection = Arango.getUserCollection();
    return new Promise(function (resolve, reject) {
        var datetime = new Date().toISOString().replace(/T/, ' ').substr(0, 10);
        UsersCollection.save({
            "username": username,
            "email": email,
            "hash": hash,
            "signUpDate": datetime
        }).then((meta) => {
            resolve({
                "username": username,
                "signUpDate": datetime,
                "id": meta._key
            });
        },(err) => {
            reject(err);
        }).catch((err) => {
            reject(err);
        });
    });
}

function getUserByUsername(username){

    return new Promise(function (resolve, reject) {
        console.log(' ========== un', username);
        db.query(`
            FOR doc IN users 
                FILTER doc.username == "${username}"
                RETURN doc
            `).then((cursor) => {

                cursor.all().then((data) => {
                    console.log('---------- resolving data; ', data);
                    resolve(data);
                }).catch((err) => {
                    reject(err);
                });

            }).catch((err) => {
                reject(err);
            });
    });
}

//used to check if a signup can happen
function checkIfUnique(newUserObject){
    return new Promise(function (resolve, reject) {
        db.query(`
            FOR doc IN users 
                FILTER doc.username == "${newUserObject.username}" || doc.email == "${newUserObject.email}"
                RETURN doc
            `).then((cursor) => {

                cursor.all().then((data) => {

                    if (data.length > 0) {
                        resolve(false);
                    } else {
                        resolve(true);   
                    }

                }).catch((err) => {
                    reject(err);
                });

            }).catch((err) => {
                reject(err);
            });
    });
}

function getUserByKey(key){
    return new Promise(function (resolve, reject) {
        var UsersCollection = Arango.getUserCollection();
        UsersCollection.document(key).then((userObject) => {
            resolve(userObject);
        }).catch((err) => {
            reject(err);
        });
    });
}

function updateUser(userObject){
    UsersCollection.update(userObject).then(
        meta => console.log('Document saved:', meta._rev),
        err => console.error('Failed to save document:', err)
    );
}

function deleteUser(userKey){
    return new Promise(function (resolve, reject) {
        var UsersCollection = Arango.getUserCollection();
        UsersCollection.remove(userKey).then((meta) => {
            resolve(meta);
        }).catch((err) => {
            reject(err);
        });
    });
}

module.exports = {
    createUser: createUser,
    getUserByUsername: getUserByUsername,
    checkIfUnique: checkIfUnique,
    getUserByKey: getUserByKey,
    updateUser: updateUser,
    deleteUser: deleteUser
}