var Users = require('../../controllers/users/_index.js');

module.exports = function deleteUser(req, res) {
    Users.deleteUser(req.user._key).then((meta) => {
        req.logout();
        res.set(200);
        res.json({message: 'User was deleted'});
    }).catch((err) => {
        res.set(500);
        res.json({errors: [{title:'There was a problem when deleting this user'}]});
    });
}