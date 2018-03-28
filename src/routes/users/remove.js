var Users = require("../../controllers/users/_index.js");

module.exports = function deleteUser(req, res) {
  Users.deleteUser(req.user._key)
    .then(meta => {
      req.logout();
      res.json({
        data: {
          message: "User was deleted"
        }
      });
    })
    .catch(err => {
      res.json({
        errors: [{ title: "There was a problem when deleting this user" }]
      });
    });
};
