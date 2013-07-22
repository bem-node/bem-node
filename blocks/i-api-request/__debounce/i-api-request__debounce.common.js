/**
 * Request json api, with debounce
 */
BEM.decl('i-api-request', null, {

    _debounceParams: [],

    _findDebounceParams: function (data) {
        if (data && data.params) {
            return this._debounceParams.filter(function (key) {
                return data.params[key];
            });
        }
        return null;
    },

    _getDebounceCacheKey: function (resource, data, debounceParams) {
        //TODO: try to make it faster
        var debounceData = jQuery.extend({}, data);
        debounceData.params = jQuery.extend({}, debounceData.params);
        debounceParams.forEach(function (key) {
            delete debounceData.params[key];
        });
        return 'debounce:' + this._getCacheKey(resource, debounceData);
    },


    /**
     * Passing result to promises
     *
     * @param {Object} result
     * @param {Array.<Object>} debounceQuery Hash with wiating promises
     * @conf {Vow.promise} promise
     * @conf {Object} params
     * @param {Object} resource
     */
    _debounceFulfill: function (result, debounceQuery /*, resource*/) {
        debounceQuery.forEach(function (query) {
            query.promise.fulfill(result);
        });
    },
    
    /**
     * Passing result to promises
     *
     * @param {Error} err
     * @param {Array.<Object>} debounceQuery Hash with wiating promises
     * @conf {Vow.promise} promise
     * @conf {Object} params
     */
    _debounceReject: function (err, debounceQuery) {
        debounceQuery.forEach(function (query) {
            query.promise.reject(err);
        });
    },
    
    /**
     * Creating cached values
     * @param {Object} params Request params
     * @return {Object}
     */
    _debounceQuery: function (params) {
        return {
            params: params,
            promise: Vow.promise()
        };
    },

    /**
     * Http get, with debounce
     */
    get: function (resource, data) {
        var debounceParamsKeys = this._findDebounceParams(data),
            cacheKey, cacheStorage,
            __base = this.__base.bind(this),
            _this = this,
            debounceParams,
            debounceParamsStr,
            debounceQuery;

        if (debounceParamsKeys && debounceParamsKeys.length) {

            debounceParams = debounceParamsKeys.reduce(function (obj, key) {
                obj[key] = data.params[key];
                return obj;
            }, {});

            debounceParamsStr = JSON.stringify(debounceParams);

            cacheKey = this._getDebounceCacheKey(resource, data, debounceParamsKeys);
            cacheStorage = this._getCacheStorage();

            if (!cacheStorage[cacheKey]) {
                //create debounce
                cacheStorage[cacheKey] = {};
                this._nextTick(function () {
                    var debounceQuery = cacheStorage[cacheKey],
                        ids = Object.keys(debounceQuery),
                        params = debounceParamsKeys.reduce(function (o, key) {
                            o[key] = [];
                            return o;
                        }, {}),
                        paramKey;

                    ids.forEach(function (key) {
                        var requestParams = debounceQuery[key].params,
                            paramKey;
                        for (paramKey in requestParams) {
                            if (requestParams.hasOwnProperty(paramKey)) {
                                params[paramKey] = params[paramKey].concat(
                                    typeof requestParams[paramKey] === 'string' ?
                                        requestParams[paramKey].split(',') : requestParams[paramKey]
                                );
                            }
                        }
                    });

                    delete cacheStorage[cacheKey];

                    for (paramKey in params) {
                        if (params.hasOwnProperty(paramKey)) {
                            data.params[paramKey] = params[paramKey].join();
                        }
                    }

                    // keys may change in future
                    debounceQuery = Object.keys(debounceQuery).map(function (key) {
                        return debounceQuery[key];
                    });

                    __base(resource, data).then(function (result) {
                        _this._debounceFulfill(result, debounceQuery, resource);
                    }).fail(function (err) {
                        _this._debounceReject(err, debounceQuery);
                    });
                });
            }
            debounceQuery = (
                cacheStorage[cacheKey][debounceParamsStr]
                || (cacheStorage[cacheKey][debounceParamsStr] = _this._debounceQuery(debounceParams))
            );
            return debounceQuery.promise;
        } else {
            return this.__base(resource, data);
        }

    }

});

