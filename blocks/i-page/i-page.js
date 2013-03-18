/**
 * Client's implementation of base class for a page
 *
 * @abstract
 */
BEM.decl('i-page', null, {

    /**
     * Called when page params changed
     *
     * @param {Array} matchers matched params from path
     * @return {Vow.promise}
     */
    update: function (matchers) {
        return Vow.fulfill();
    },

    /**
     * Called when leaving current page
     *
     * @return {Vow.promise}
     */
    destruct: function () {
        return Vow.fulfill();
    }

});
