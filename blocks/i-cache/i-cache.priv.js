/**
 * Simple caching
 */
(function () {
    var CACHE_TIME = 1000 * 60 * 1,
        storage = {};
    BEM.decl('i-cache', null, {

        /**
         * Find cache by options
         *
         * @param {Object} options
         * @param {String} options.key
         * @param {Number} options.time ms
         * @returns {Vow.promise} promise
         * @returns {Object} promise.fulfill.arguments[0] cache value
         * @returns {Function} promise.reject when cache invalid or not found
         */
        _checkCache: function (options) {
            if (
                storage[options.key] &&
                Date.now() < storage[options.key].ts
            ) {
                return Vow.fulfill(storage[options.key].data);
            }
            return  Vow.reject();
        },
        
        /**
         * Set cache by options
         *
         * @param {Object} options
         * @param {String} options.key
         * @param {Number} options.time ms
         * @param {Object} data
         * @returns {Vow.promise} promise
         */
        _setCache: function (options, data) {
            storage[options.key] = {
                data: data,
                ts: Date.now() + options.time + Math.round(10 * 1000 * Math.random())
            };
            return Vow.fulfill(data);
        },

        /**
         * Set cache and returns cache value
         *
         * @param {Object} options
         * @param {String} options.key
         * @param {Number} options.time ms
         * @param {Function} callback
         * @returns {Vow.promise} promise
         * @returns {Object} promise.fulfill.arguments[0] cached data
         */
        result: function (options, callback) {
            var _this = this;
            if (typeof options === 'string') {
                options = {
                    key: options
                };
            }
            options.time = options.time || CACHE_TIME;
            return this._checkCache(options).fail(function () {
                return callback().then(function (data) {
                    return _this._setCache(options, data).always(function () {
                        return data;
                    });
                });
            });
        },

        /**
         * Cache bem block/elem
         *
         * @param {Object} ctx BEM.JSON.ctx
         * @param {String|Array} key caching key
         * @param {Number} time ms
         *
         */
        cacheCtx: function (ctx, key, time) {
            var params = ctx.params(), blockParams,
                blockName = params.block || ctx._currBlock.block;
            if (!params.noCache) {
                blockParams = Object.keys(params).filter(function (param) {
                    return param.charAt(0) !== '_';
                });
                return this.result({
                    key: [
                        blockName,
                        params.elem,
                        params.mods && JSON.stringify(params.mods),
                        blockParams.join()
                    ].concat(key).filter(Boolean).join('.'),
                    time: time
                }, function () {
                    var block = {
                        noCache: true,
                        block: blockName
                    };
                    blockParams.forEach(function (key) {
                        block[key] = params[key];
                    });
                    return BEM.blocks['i-content'].html(block);
                }).then(function (html) {
                    ctx.wrap([html]);
                    ctx.stop();
                });
            } else {
                return Vow.fulfill('');
            }

        }
    });
}());
