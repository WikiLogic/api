"use strict";

var getById = require('./by-id.js');
var getBySearchTerm = require('./by-search-term.js');
var getRandom = require('./random.js');

/* All that really changes between claim requests is the cypher query.
 */

module.exports = {
    bySearchTerm: getBySearchTerm,
    byId: getById,
    random: getRandom   
}