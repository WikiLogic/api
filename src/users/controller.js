var Arango = require('../_arango/_db');
var UserModel = {
    username: "username",
    email: "email",
    hash: "hash",
    signUpDate: "dateString"
}

function createUser(email, username, hash){
    var UsersCollection = Arango.getUserCollection();
    console.log("------ create user: ",UsersCollection, email, username, hash);
    return new Promise(function (resolve, reject) {
        UsersCollection.save({
            "username": username,
            "email": email,
            "hash": hash,
            "signUpDate": "today"
        }).then((meta) => {
            console.log('User signup success:', meta);
            resolve(meta);
        },(err) => {
            console.error('Failed to save document:', err)
            reject(err);
        }).catch((err) => {
            console.log("Sign up error", err);
            reject(err);
        });
    });
}

function getUserByUsername(username){

    return new Promise(function (resolve, reject) {
        console.log("runninb quesy");
        db.query(`
            FOR doc IN users 
                FILTER doc.username == "${username}"
                RETURN doc
            `).then((cursor) => {

                cursor.all().then((data) => {
                    console.log('===== DATAAA', JSON.stringify(data));
                    resolve(data);
                }).catch((err) => {
                    console.log("Cursor to get user by name", err);
                    reject(err);
                });

            }).catch((err) => {
                console.log("DB Failed to get user by name", err);
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
    updateUser: updateUser,
    deleteUser: deleteUser
}