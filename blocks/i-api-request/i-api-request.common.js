/**
 * Request json api
 */
BEM.decl('i-api-request', null, {

    /**
     * @type {HttpError}
     */
    _HttpError: (function () {
        return BEM.blocks['i-errors'].HttpError;
    }()),

    /**
     * Trim slashes from resource
     */
    _normalizeResource: function (resource) {
        return String(resource).replace(/^\/|\/$/g, '');
    },

    /**
     * Checking if cache should be droped before request
     *
     * @param {String} method
     * @param {String} [resource]
     * @param {Object} [data]
     * @return {Boolean}
     */
    _checkDropCache: function (method) {
        return method !== 'get';
    },

    /**
     * Get json string of body
     */
    _normalizeBody: function (body) {
        if (typeof body === 'object') {
            return JSON.stringify(body);
        } else {
            return String(body);
        }
    },

    /**
     * Pass parsed json to promise resolve
     */
    _parse: function (promise, result) {
        try {
            promise.fulfill(JSON.parse(result));
        } catch (err) {
            promise.reject(err);
        }

    },

    /**
     * @deprecated
     */
    isHttpError: function () {
        console.error('Deprecated use BEM.blocks.i-errors.isHttpError');
        return BEM.blocks['i-errors'].apply(BEM.blocks['i-errors'], arguments);
    },

    /**
     * Makes http get request
     *
     * @param {String} resource
     * @param {Object} [options] request options
     * @returns {Vow.promise}
     */
    _get: function (resource, options) {
        return this._request('get', resource, options);
    },

    /**
     * serialize request and get cache key
     */
    _getCacheKey: function (resource, data) {
        //TODO: find faster method
        return resource + '?' + (data && Object.keys(data).sort().map(function (dataKey) {
            var dataValue = data[dataKey];
            if (typeof dataValue === 'object') {
                dataValue = JSON.stringify(dataValue);
            }
            return dataKey + '=' + dataValue;
        }).join('&'));
    },

    _requestCache: BEM.blocks['i-state'].initNs('i-api-request.requestCache'),

    /**
     *  Create cache storage for every block based on i-api-request
     */
    _getCacheStorage: function () {
        // TODO this._name
        var cache = this._requestCache.get(this._name);
        if (!cache) {
            cache = {};
            this._requestCache.set(this._name, cache);
        }
        return cache;
    },

    /**
     * Saves key/value for request/session
     */
    _setCache: function (key, value) {
        this._getCacheStorage()[key] = value;
    },

    /**
     * Get saved key/values for request/session
     */
    _getCache: function (key) {
        return this._getCacheStorage()[key];
    },

    /**
     * Drop request cache of current block
     */
    dropCache: function () {
        this._requestCache.set(this._name, {});
    },

    /**
     * Http get request with cache
     * Will take request promise from cache,
     * otherwise send http get request and put promise into cache
     *
     * @param {String} resource
     * @param {Object} [options] request options
     * @param {Object} [options.params] request params
     * @returns {Vow.promise}
     */
    get: function (resource, options) {
        var cacheKey = options && options.cacheKey || this._getCacheKey(resource, options),
            promise = this._getCache(cacheKey);

        if (!promise) {
            promise = this._get(resource, options);
            this._setCache(cacheKey, promise);
        }

        return promise;
    }

});

