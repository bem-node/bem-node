BEM.decl('i-cookie', null, {
    /**
     * Get cookie
     * @param {String} name
     */
    get: function (name) {
        return BEM.blocks['i-router'].getCookies().get(name);
    },

    /**
     * set cookie
     * @param {String} name
     * @param {String} val
     * @param {Object} [params]
     */
    set: function (name, val, params) {
        return BEM.blocks['i-router'].getCookies().set(name, val, params);
    }
});
