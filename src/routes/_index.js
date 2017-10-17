var userRoutes = require('./users/_index.js');
var claimRoutes = require('./claims/_index.js');
var argumentRoutes = require('./arguments/_index.js');
var analyticsRoutes = require('./analytics/_index.js');

module.exports = {
    analytics: analyticsRoutes,
    users: userRoutes,
    claims: claimRoutes,
    arguments: argumentRoutes
}