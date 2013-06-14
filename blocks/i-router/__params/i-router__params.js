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
     * Sets params to url with history.pushState
     * @param {Object} params
     * @param {Boolean} [allowFallback=false]
     * @param {Boolean} [extend=false] will extend current params
     */
    setParams: function (params, allowFallback, extend) {
        return this._changeParams.call(this, 'set', params, allowFallback, extend);
    },
    /**
     * Replace current params with history.replaceState
     * @param {Object} params
     * @param {Boolean} [allowFallback=false]
     * @param {Boolean} [extend=false] will extend current params
     */
    replaceParams: function (params, allowFallback, extend) {
        return this._changeParams.call(this, 'replace', params, allowFallback, extend);
    },
    /**
     * Change params
     * @param {Object} params
     * @param {Boolean} [allowFallback=false]
     * @param {Boolean} [extend=false] will extend current params
     * @private
     * @returns {*}
     */
    _changeParams: function (method, params, allowFallback, extend) {
        var search = '';
        if (extend) {
            jQuery.extend(params, this.get('params'));
        }
        search += jQuery.param(params);
        if (location.search === ('?' + search)) {
            return;
        }
        this.set('params', params);
        return this[method + 'Path'](location.pathname + (search ? '?' + search : ''), allowFallback);
    },
    /**
     * Return current i-router params as query string
     * @returns {String} something like "?bla=1&name=blabla"
     */
    encodedParams: function () {
        return location.search;
    }

});

