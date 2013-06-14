/**
 * Read get and set params from\to location
 *
 */
BEM.decl('i-router', null, {

    /**
     * Get current url params hash
     *
     * @return {Object}
     */
    _readParams: function (search) {
        this.set(
            'params',
            String(arguments.length === 1 ? search : location.search)
                .replace(/^\?/, '')
                .split('&')
                .reduce(function (urlParamsObj, keyValue) {
                    var keyValueAr = keyValue.split('=');
                    if (keyValueAr.length === 2) {
                        urlParamsObj[keyValueAr[0]] = decodeURIComponent(
                            String(keyValueAr[1].replace(/\+/g, ' '))
                        );
                    }
                    return urlParamsObj;
                }, {})
        );
    },
    /**
     * Set params to current page url
     * @param {Object} params
     * @param {Boolean} [allowFallback=false]
     * @param {Boolean} [extend=false] will extend current params
     * @returns {*}
     */
    setParams: function (params, allowFallback, extend) {
        var search = '?';
        if (extend) {
            jQuery.extend(params, this.get('params'));
        }
        search += jQuery.param(params);
        if (location.search === search) {
            return;
        }
        this.set('params', params);
        return this.setPath(location.pathname + search, allowFallback);
    },
    /**
     * Return current i-router params as query string
     * @param {Array} allowedParams
     * @returns {String} something like "?bla=1&name=blabla"
     */
    encodedParams: function (allowedParams) {
        return jQuery.param(this._allowedParams(allowedParams));
    }

});

