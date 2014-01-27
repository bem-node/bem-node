/**
 * Base class for pages
 *
 * @abstract
 */
(BEM.DOM || BEM).decl({block: 'i-page'}, null, {

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
     * Set html title for page
     *
     * @abstract
     * @param {String} title page title
     * @return {i-content}
     */
    setTitle: function () {
        throw new Error('Method "setTitle" should be implemented.');
    },

    /**
     * Set html description meta tag for page
     *
     * @param {String} text description content
     * @return {i-content}
     */
    setDescription: function () {
        return this;
    },

    /**
     * Set content for meta tag
     *
     * @param {String} name name of a meta tag
     * @param {String} content content for given meta tag
     * @return {i-content}
     */
    setMeta: function () {
        return this;
    },

    /**
     * Process bemjson and bemhtml then output generated html
     * @abstract
     * @param {Mixed} json
     */
    out: function () {},

    /**
     * Process given bemjson to html
     *
     * @param {String|Object|Array} bemJson
     * @param {Boolean} [isSync] if true, method will perform synchronous BEM.JSON.build and return a html string
     * @return {Vow.promise|String}
     */
    html: function () {
        return BEM.blocks['i-content'].html.apply(BEM.blocks['i-content'], arguments);
    }

});
