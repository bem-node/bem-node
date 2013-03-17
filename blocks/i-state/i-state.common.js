/**
 * Implements storage visible only for current request
 */
BEM.decl('i-state', null, {

    /**
     * Create state accessors for given namespase
     *
     * @param {String} ns namespace
     * @return {Function}
     */
    initNs: function (ns) {
        var _this = this;

        return {
            get: function (path) {
                return _this.get(ns + (path ? '.' + path : ''));
            },
            set: function (path, data) {
                _this.set(ns + (path ? '.' + path : ''), data);
                return this;
            }
        };
    },

    /**
     * Get data from storage
     *
     * @abstract
     * @param {String} path
     */
    get: function get(path) {},

    /**
     * Set data to store
     *
     * @param {String} path data path to store data
     * @param {Mixed} data data to store
     * @return {i-state}
     */
    set: function (path, data) {
        var pathArr = path.split('.'),
            store = this.get(),
            key;

        while ((key = pathArr.shift()) && pathArr.length) {
            store = store[key] || (store[key] = {});
        }

        store[key] = data;

        return this;
    },

    /**
     * Get object property by path
     */
    _getParam: function (path, state) {
        try {
            return eval('state["' + path.split('.').join('"]["') + '"]');
        } catch (err) {
            return null;
        }
    }

});
