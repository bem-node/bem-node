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
        var cache = options && options.hasOwnProperty('cache') ? options.cache : this._cache,
            _this = this,
            promise;

        if (cache === false) {
            return this._get(resource, options);
        }

        options = options || {};
        options.cacheKey = this._getCacheKey(resource, options);
        promise = this.__base.apply(this, arguments);

        // If promise was failed, we can reset cache (only on client-side)
        promise.fail(function () {
            delete _this._getCacheStorage()[options.cacheKey];
        });

        return promise;
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
    
    /**
     * Modifying request params before maing ajax request
     *
     * @param {String} resource
     * @param {Object} data will be modefied after calling
     * @return {Object} data
     */
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
     * Creating pathname for ajax query
     *
     * @param {String} method
     * @return {String}
     */
    _createAjaxUrl: function (method) {
        return '/ajax/' + this._name + '/' + method;
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
     * Calls when http status is not equal to 200
     *
     * @param {XMLHttpRequest} xhr of request
     * @param {String} method Http method
     * @param {String} resource
     * @param {Object} data
     *
     * @returns {Vow.promise} if fulfilled then retry will be occur
     */
    _shouldRetry: function () {
        return Vow.reject();
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
        data = this._prepareData(resource, data);

        if (this._checkDropCache(method, resource, data)) {
            this.dropCache();
        }

        this._activeXhrs = this._activeXhrs || [];
        return this._makeAjax(method, resource, data);
    },
    
    /**
     * Making ajax qeury with jQuery
     *
     *  @param {String} method Http method
     *  @param {String} resource
     *  @param {Object} data
     *  @return {Vow.Promise}
     */
    _makeAjax: function retry(method, resource, data) {
        var promise = Vow.promise(),
            _this = this;

        BEM.channel('i-api-request').trigger('beforerequest');
        this._activeXhrs.push({
            promise: promise,
            xhr: jQuery.ajax({
                type: data.body ? 'POST' : 'GET',
                url: this._createAjaxUrl(method),
                data: data,
                complete: function (xhr) {
                    if (xhr.status === 200) {
                        promise.sync(Vow.invoke(function () {
                            return JSON.parse(xhr.responseText);
                        }));
                    } else {
                        _this._shouldRetry(xhr, method, resource, data)
                            .then(function () {
                                retry.call(_this, method, resource, data)
                                    .then(
                                        promise.fulfill.bind(promise),
                                        promise.reject.bind(promise)
                                    )
                                    .done();

                            })
                            .fail(function (e) {
                                var error = e || new _this._HttpError(
                                    xhr.status,
                                    xhr.statusText,
                                    xhr.responseTex
                                );
                                BEM.channel('i-api-request').trigger('error', error);
                                promise.reject(error);
                            })
                            .done();
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

