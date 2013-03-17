/**
 * Implements storage visible only for current request
 */
(function () {

    var state = {};

    BEM.decl('i-state', null, {

        /**
         * Get data from storage
         *
         * @param {String} path
         */
        get: function get(path) {
            return path ? this._getParam(path, state) : state;
        }

    });

}());
