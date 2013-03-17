/**
 * Implements storage visible only for current request
 */
BEM.decl('i-state', null, {

    _domain: require('domain'),

    /**
     * If some lib do not support domains, you need to bind domain on callback
     *
     * @param {Function} callback
     * @return {Function} Callback binded to current domain
     */
    bind: function (callback) {
        if (process.domain) {
            return process.domain.bind(callback);
        } else {
            return callback;
        }
    },

    /**
     * Get data from storage
     *
     * @param {String} path
     */
    get: function get(path) {
        var state;
        if (process.domain) {
            state = process.domain.state || {};
            if (!process.domain.state) {
                process.domain.state = state;
            }
            return path ? this._getParam(path, state) : state;
        } else {
            throw new Error('Not in domain');
        }
    }

});
