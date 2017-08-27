var UsersCollection = require('../_arango/_db').users;
var UserModel = {
    name: "username",
    email: "email",
    password: "hash",
    signUpDate: "dateString"
}

function createUser(userObject){
    UsersCollection.save(userObject).then(
        meta => console.log('Document saved:', meta._rev),
        err => console.error('Failed to save document:', err)
    );
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