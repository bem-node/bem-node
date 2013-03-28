/**
 * Base class for pages
 *
 * @abstract
 */
BEM.decl({block: 'i-page', baseBlock: 'i-content'}, null, {

    /**
     * Called when route on page was changed
     *
     * @param {Array} matchers matched params from path
     * @return {Vow.promise}
     */
    init: function () {
        return this.out('');
    },
    
    /**
     * Process bemjson and bemhtml then output generated html
     * @abstract
     * @param {Mixed} json
     */
    out: function () {},

});
