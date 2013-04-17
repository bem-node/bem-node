/**
 * Convert bemjson parts to content
 *
 */
BEM.decl('i-content', null, {

    /**
     * Process given bemjson to html
     *
     * @param {String|Object|Array} bemJson
     * @param {Boolean} [isSync] if true, method will perform synchronous BEM.JSON.build and return a html string
     * @return {Vow.promise|String}
     */
    html: function (bemJson, isSync) {
        return (isSync) ? this._htmlSync(bemJson) : this._htmlAsync(bemJson);
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

    _htmlSync: function (json) {
        return BEMHTML.call(BEM.JSON.build(json));
    },

    _htmlAsync: function (json) {
        var promise;

        if (typeof (json) === 'string') {
            promise = Vow.fulfill(json);
        } else {
            promise = Vow.promise();
            BEM.JSON.buildAsync(
                json,
                function (result) {
                    promise.fulfill(BEMHTML.call(result));
                }
            );
        }

        return promise;
    }

});
