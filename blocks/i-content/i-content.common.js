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
