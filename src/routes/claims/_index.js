var searchRoute = require('./search.js');
var createRoute = require('./create.js');
var removeRoute = require('./remove.js');
var getByIdRoute = require('./getById.js');
var getRoute = require('./get.js');

module.exports = {
    search: searchRoute,
    create: createRoute,
    remove: removeRoute,
    getById: getByIdRoute,
    get: getRoute
}