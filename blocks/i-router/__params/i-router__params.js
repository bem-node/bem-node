/**
 * Read get params from location
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
    }

});

