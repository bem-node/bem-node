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
        if (!Array.isArray(bemJson)) {
            bemJson = [bemJson];
        }
        return (isSync) ? this._htmlSync(bemJson) : this._htmlAsync(bemJson);
    },

    _htmlSync: function (json) {
        return BEMHTML.apply(BEM.JSON.build(json));
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
                    promise.fulfill(BEMHTML.apply(result));
                }
            );
        }

        return promise;
    },

    /**
     * Escape html special chars
     *
     * @param {String} html
     * @return {String} text
     */
    escapeHTML: function (html) {
        return String(html)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    /**
     * Unescape html special chars
     *
     * @param {String} text
     * @return {String} html
     */
    unescapeHTML: function (text) {
        return String(text)
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, '\'')
            .replace(/&#x2F;/g, '/');
    }

});
