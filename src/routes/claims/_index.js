var searchRoute = require('./search.js');
var createRoute = require('./create.js');
var removeRoute = require('./remove.js');
var getRoute = require('./get.js');

module.exports = {
    search: searchRoute,
    create: createRoute,
    remove: removeRoute,
    get: getRoute
}