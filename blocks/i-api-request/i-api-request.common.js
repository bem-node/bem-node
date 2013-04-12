/**
 * Request json api
 */
BEM.decl('i-api-request', null, {

    /**
     * Http error constructor
     *
     * @param {Number} status
     * @param {String} message
     * @param {String} responseBody
     */
    _HttpError: function (status, message, responseBody) {
        this.name = 'E_HTTP_ERROR';
        this.status = status;
        this.message = message;
        if (responseBody) {
            this.message += ' ' + String(responseBody).replace(/\n/g, '\\n');
        }
    },

    /**
     * Trim slashes from resource
     */
    _normalizeResource: function (resource) {
        return String(resource).replace(/^\/|\/$/, '');
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
     * Check if error is Http error
     *
     * @param {Error} error
     * @return {Boolean}
     */
    isHttpError: function (error) {
        return error instanceof this._HttpError;
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
     * Http get with cache
     */
    get: function (resource, data) {
        var cacheKey = this._getCacheKey(resource, data),
            promise = this._getCache(cacheKey);
        if (!promise) {
            promise = this._request('get', resource, data);
            this._setCache(cacheKey, promise);
        }
        return promise;
    }

});

