/**
 * Request json api from browser
 */

BEM.decl('i-api-request', null, {

    /**
     * Enables/disables caching of get requests
     *
     * @var {Boolean}
     */
    _cache: true,

    /**
     * Http get request
     *
     * @override {i-api-request}
     * @param {String} resource
     * @param {Object} [options] request options
     * @param {Object} [options.params] request params
     * @param {Object} [options.cache] if false, will disable request caching
     * @returns {Vow.promise}
     */
    get: function (resource, options) {
        var cache = options && options.hasOwnProperty('cache') ? options.cache : this._cache;

        if (cache === false) {
            return this._get(resource, options);
        }

        return this.__base.apply(this, arguments);
    },

    /**
     * Abort one request identified by argument
     * @protected
     * @param {Vow} request. Vow promise, that defines xhr to abort
     */
    _abortOneRequest: function (request) {
        var i,
            xhrPromisePair;
        for (i = 0; i < this._activeXhrs.length; i++) {
            if (this._activeXhrs[i].promise === request) {
                xhrPromisePair = this._activeXhrs[i];
                this._activeXhrs.splice(i, 1);
                break;
            }
        }
        if (xhrPromisePair) {
            xhrPromisePair.xhr.abort();
        }
    },

    /**
     *  Aborts request(s) defined by argument
     *  @param {undefined | Vow | Array<Vow>} requests
     *  if requests is undefined abort all requests
     *  if requests is Vow promise -- abort corresponding request
     *  if request is array of Vow promises, abort their corresponding requests
     */
    abort: function (requests) {
        var i;
        if (!this._activeXhrs) {
            return;
        }
        if (!requests) {
            //short path for aborting all requests
            while (this._activeXhrs.length) {
                this._activeXhrs.pop().xhr.abort();
            }
        } else if (requests instanceof Array) {
            for (i = 0; i < requests.length; i++) {
                this._abortOneRequest(requests[i]);
            }
        } else {
            this._abortOneRequest(requests);
        }
    },

    _prepareData: function (resource, data) {
        data = data || {};
        data.resource = this._normalizeResource(resource);
        data.ncrd = Date.now();
        if (data.params) {
            data.params = JSON.stringify(data.params);
        }
        if (data && data.body) {
            data.body = this._normalizeBody(data.body);
        }
        return data;
    },
    /**
     *  Http request rest api
     *
     *  @param {String} method Http method
     *  @param {String} resource
     *  @param {Object} data
     *  @param {Object} [data.params] Get params
     *  @return {Vow.Promise}
     */
    _request: function (method, resource, data) {
        var promise = Vow.promise(),
            _this = this;
        data = this._prepareData(resource, data);
        if (method !== 'get') {
            this.dropCache();
        }
        this._activeXhrs = this._activeXhrs || [];
        BEM.channel('i-api-request').trigger('beforerequest');
        this._activeXhrs.push({
            promise: promise,
            xhr: jQuery.ajax({
                type: data.body ? 'POST' : 'GET',
                url: '/ajax/' + this._name + '/' + method,
                data: data,
                complete: function (xhr) {
                    var error;
                    if (xhr.status === 200) {
                        _this._parse(promise, xhr.responseText);
                    } else {
                        error = new _this._HttpError(xhr.status, xhr.statusText, xhr.responseText);
                        BEM.channel('i-api-request').trigger('error', error);
                        promise.reject(error);
                    }
                    _this._activeXhrs = _this._activeXhrs.filter(function (xhrItem) {
                        return xhr !== xhrItem.xhr;
                    });
                    BEM.channel('i-api-request').trigger('afterrequest');
                }
            })
        });

        return promise;
    }

});
