var search = require('./by-search-term.js');
var getRandom = require('./random.js');
var getById = require('./by-id.js');
var create = require('./create-claim.js');

module.exports = {
    search: search,
    getRandom: getRandom,
    getById: getById,
    create: create
}