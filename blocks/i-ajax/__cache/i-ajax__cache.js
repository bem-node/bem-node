/**
 * Caching implementation for i-ajax
 */
(function () {
    // Static reference to slice
    var _slice = [].slice;

    BEM.decl('i-ajax', {}, {
        /**
         * Default cache timeout: 5 minutes
         */
        _cacheTimeout: 5 * 60 * 1000,

        /**
         * List of cacheble methods with configs
         */
        _cacheKeys: {},

        /**
         * Cache itself
         */
        _cache: {},

        /**
         * @override Add parsing ajaxMethods for caching configs
         * @param {Array} ajaxMethods
         * @param {String} blockName
         * @returns {Object}
         */
        create: function (ajaxMethods, blockName) {
            var _this = this;

            ajaxMethods = ajaxMethods.map(function (method) {
                if (typeof method === 'object') {
                    if (!method.name) {
                        throw new Error('Property "name" is required for cache config object');
                    }
                    if (!blockName) {
                        throw new Error('blockName param is required for caching');
                    }
                    _this._cacheKeys[[blockName, method.name].join('.')] = {
                        timeout: method.timeout * 1000 || _this._cacheTimeout
                    };

                    return method.name;
                }
                return method;
            });

            return this.__base(ajaxMethods);
        },

        /**
         * Clean cached data for all blocks OR all methods of block OR one method of block
         * @param {String} [blockName]
         * @param {String} [methodName]
         */
        cleanCache: function (blockName, methodName) {
            var _this = this,
                cacheKeyPrefix;

            if (!blockName && !methodName) {
                this._cache = {};
            } else {
                cacheKeyPrefix = [blockName || '', methodName || ''].join('.');
                Object.keys(this._cache).forEach(function (item) {
                    if (item.indexOf(cacheKeyPrefix) === 0) {
                        delete _this._cache[item];
                    }
                });
            }
        },

        /**
         * @override Add caching for requests
         * @param {String} blockName
         * @param {String} methodName
         * @param {String} args
         * @returns {Vow}
         * @private
         */
        _addRequestToQueue: function (blockName, methodName, args) {
            var __base = this.__base.bind(this),
                cacheConfigKey = [blockName, methodName].join('.'),
                cacheKey = [cacheConfigKey, JSON.stringify(_slice.call(args, 0))].join('.'),
                promise;

            if (this._cacheKeys[cacheConfigKey]) {
                if (this._cache[cacheKey] && this._cache[cacheKey].timeout > Date.now()) {
                    // if cache exists and not expired - return cached promise
                    promise = this._cache[cacheKey].promise;
                } else {
                    // if cache not exists or cache is timeouted - make request and make new cached promise
                    promise = __base(blockName, methodName, args);
                    this._cache[cacheKey] = {
                        promise: promise,
                        timeout: Date.now() + this._cacheKeys[cacheConfigKey].timeout
                    };
                }
            } else {
                promise = __base(blockName, methodName, args);
            }

            return promise;
        }
    });
}());
