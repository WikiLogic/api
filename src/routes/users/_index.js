var loginRoute = require('./login.js');
var signupRoute = require('./signup.js');
var profileRoute = require('./profile.js');
var removeRoute = require('./remove.js');

module.exports = {
    login: loginRoute,
    signup: signupRoute,
    remove: removeRoute,
    profile: profileRoute
}