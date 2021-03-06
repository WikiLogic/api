var Arango = require("../../_arango/_db");
var aql = require("arangojs").aql;
var UserModel = {
  username: "username",
  email: "email",
  hash: "hash",
  signUpDate: "dateString"
};

function createUser(email, username, hash) {
  var UsersCollection = Arango.getUserCollection();
  return new Promise(function(resolve, reject) {
    var datetime = new Date()
      .toISOString()
      .replace(/T/, " ")
      .substr(0, 10);
    UsersCollection.save({
      username: username,
      email: email,
      hash: hash,
      signUpDate: datetime
    })
      .then(meta => {
        resolve({
          username: username,
          signUpDate: datetime,
          id: meta._key
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

function getUserByUsername(username) {
  return new Promise(function(resolve, reject) {
    const userCollection = Arango.getUserCollection();
    const query = aql`FOR doc IN ${userCollection} 
                FILTER doc.username == ${username}
                RETURN doc`;
    Arango.db
      .query(query)
      .then(cursor => {
        resolve(cursor.all());
      })
      .catch(err => {
        console.log("get by username errr", err);
        reject(err);
      });
  });
}

//used to check if a signup can happen
function checkIfUnique(newUserObject) {
  return new Promise(function(resolve, reject) {
    const userCollection = Arango.getUserCollection();
    const query = aql`FOR doc IN ${userCollection} 
                FILTER doc.username == ${
                  newUserObject.username
                } || doc.email == ${newUserObject.email}
                RETURN doc`;
    Arango.db
      .query(query)
      .then(cursor => {
        cursor
          .all()
          .then(data => {
            if (data.length > 0) {
              resolve(false);
            } else {
              resolve(true);
            }
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        console.log("Check unique - get users error: ", err);
        reject(err);
      });
  });
}

function getUserByKey(key) {
  return new Promise(function(resolve, reject) {
    var UsersCollection = Arango.getUserCollection();
    UsersCollection.document(key)
      .then(userObject => {
        resolve(userObject);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function updateUser(userObject) {
  UsersCollection.update(userObject)
    .then(meta => {
      console.log("Document saved:", meta._rev);
    })
    .catch(err => {
      console.log("Failed to save document:", err);
    });
}

function deleteUser(userKey) {
  return new Promise(function(resolve, reject) {
    var UsersCollection = Arango.getUserCollection();
    UsersCollection.remove(userKey)
      .then(meta => {
        resolve(meta);
      })
      .catch(err => {
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
};
