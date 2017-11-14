var userRoutes = require('./users/_index.js');
var claimRoutes = require('./claims/_index.js');
var argumentRoutes = require('./arguments/_index.js');
var adminRoutes = require('./admin/_index.js');

module.exports = {
    admin: adminRoutes,
    users: userRoutes,
    claims: claimRoutes,
    arguments: argumentRoutes
}