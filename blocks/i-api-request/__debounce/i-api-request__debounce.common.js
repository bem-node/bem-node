/**
 * Request json api, with debounce
 */
BEM.decl('i-api-request', null, {

    _debounceParams: [],

    _findDebounceParams: function (data) {
        var key = this._debounceParams.length,
            value;
        if (data && data.params) {
            while (key--) {
                value = data.params[this._debounceParams[key]];
                if (value) {
                    if (String(value).split(',').length > 1) {
                        return;
                    } else {
                        return this._debounceParams[key];
                    }
                }
            }
        }
    },

    _getDebounceCacheKey: function (resource, data, debounceParam) {
        //TODO: try to make it faster
        var debounceData = jQuery.extend({}, data);
        debounceData.params = jQuery.extend({}, debounceData.params);
        delete debounceData.params[debounceParam];
        return this._getCacheKey(resource, debounceData);
    },


    /**
     * Passing result to promises
     *
     * @param {Object} result
     * @param {Object} promises Hash with wiating promises
     * @param {Object} resource
     */
    _debounceFulfill: function (result, promises /*, resource*/) {
        Object.keys(promises).forEach(function (id) {
            promises[id].fulfill(result);
        });
    },

    _debounceReject: function (err, promises) {
        Object.keys(promises).forEach(function (id) {
            promises[id].reject(err);
        });
    },

    /**
     * Http get, with debounce
     */
    get: function (resource, data) {
        var debounceParam = this._findDebounceParams(data),
            cacheKey, cacheStorage,
            __base = this.__base.bind(this),
            _this = this;
        if (debounceParam) {
            cacheKey = this._getDebounceCacheKey(resource, data, debounceParam);
            cacheStorage = this._getCacheStorage();
            if (!cacheStorage[cacheKey]) {
                //create debounce
                cacheStorage[cacheKey] = {};
                this._nextTick(function () {
                    var ids = Object.keys(cacheStorage[cacheKey]),
                        promises = cacheStorage[cacheKey];
                    delete cacheStorage[cacheKey];
                    data.params[debounceParam] = ids.join();
                    __base(resource, data).then(function (result) {
                        if (ids.length > 1) {
                            _this._debounceFulfill(result, promises, resource);
                        } else {
                            //only one waiting promise
                            promises[ids[0]].fulfill(result);
                        }
                    }).fail(function (err) {
                        _this._debounceReject(err, promises);
                    });
                });
            }
            return (
                cacheStorage[cacheKey][data.params[debounceParam]]
                || (cacheStorage[cacheKey][data.params[debounceParam]] = Vow.promise())
            );
        } else {
            return this.__base(resource, data);
        }

    }

});

