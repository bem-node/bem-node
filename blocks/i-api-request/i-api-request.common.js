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
     * Pass parsed json to promise resolve
     * @param {Vow.promise}
     * @param {Sting} result
     * @param {String} [format]
     */
    _parse: function (promise, result, format) {
        if (format === 'string') {
            return promise.fulfill(result);
        }
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
     * Http get
     */
    get: function (resource, data) {
        return this._request('get', resource, data);
    }

});

