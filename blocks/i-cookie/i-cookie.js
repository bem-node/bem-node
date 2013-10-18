BEM.decl('i-cookie', null, {
    /**
     * Get cookie
     * @param {String} name
     */
    get: function (name) {
        return jQuery.cookie(name);
    },

    /**
     * set cookie
     * @param {String} name
     * @param {String} val
     * @param {Object} [params]
     */
    set: function (name, val, params) {
        return jQuery.cookie(name, val, params);
    }
});

