/**
 * Query
 * Date: 21.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var stampit = require('stampit');


module.exports = stampit()

    // Properties
    //
    .enclose(require('./query.params.js')) // _params
    .enclose(require('./query.filter.js')) // _filter

    // Methods
    //
    .methods({
        getQueryParameters: require('./methods/getQueryParameters'),
        start:              require('./methods/paging').start,
        count:              require('./methods/paging').count,
        select:             require('./methods/select'),
        showArchived:       require('./methods/showArchived'),
        sort:               require('./methods/sort'),
        sortMode:           require('./methods/sortMode')
    });