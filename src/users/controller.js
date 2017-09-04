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
        UsersCollection.save({
            "username": username,
            "email": email,
            "hash": hash,
            "signUpDate": "today"
        }).then((meta) => {
            resolve({
                "username": username,
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
        db.query(`
            FOR doc IN users 
                FILTER doc.username == "${username}"
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

function deleteUser(ident){
    UsersCollection.remove(ident).then(
        meta => console.log('Document saved:', meta._rev),
        err => console.error('Failed to save document:', err)
    );
}

module.exports = {
    createUser: createUser,
    getUserByUsername: getUserByUsername,
    checkIfUnique: checkIfUnique,
    getUserByKey: getUserByKey,
    updateUser: updateUser,
    deleteUser: deleteUser
}