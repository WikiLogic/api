var Arango = require('../_arango/_db')
var UserModel = {
    name: "username",
    email: "email",
    password: "hash",
    signUpDate: "dateString"
}

function createUser(email, name, password){
    var UsersCollection = Arango.getUserCollection();
    console.log("------ create user: ",UsersCollection, email, name, password);
    return new Promise(function (resolve, reject) {
        UsersCollection.save({
            "name": name,
            "email": email,
            "password": password,
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

function getUser(ident){
    //assume name for now
    UsersCollection.document(ident).then(
        doc => console.log('Document:', JSON.stringify(doc, null, 2)),
        err => console.error('Failed to fetch document:', err)
    );
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
    getUser: getUser,
    updateUser: updateUser,
    deleteUser: deleteUser
}