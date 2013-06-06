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
    out: function () {}

});
