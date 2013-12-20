/**
 * Process path and query params changes to defined pages
 *
 */
(function () {

    function getPathFromLocation() {
        return decodeURIComponent(location.pathname + location.search);
    }

    /**
     * Some browsers pops state on load, we'll process popState only if location or state were changed before
     */
    BEM.decl('i-router', null, {
        /**
         * check if history state is supported
         */
        _historyStateSupported: function () {
            return Boolean(history && history.pushState);
        },

        /**
         * Init i-router
         */
        init: function () {
            var _this = this;

            this._state.set('path', getPathFromLocation());
            this._lastPath = this.getPath();
            this._lastHandler = this._prepearRoute(this._lastPath);
            if (this._historyStateSupported()) {
                // Subscribe to popstate after 'load' event
                // to tackle bug in Chrome with 'popstate' on load
                jQuery(window).one('load', function () {
                    setTimeout(function () {
                        jQuery(document).delegate('a', 'click', function (e) {
                            if (!e.metaKey && !e.ctrlKey && this.protocol === location.protocol && 
                                this.host === location.host && !this.attributes.target) {
                                if (_this.setPath(this.pathname + this.search + this.hash)) {
                                    e.preventDefault();
                                }
                            }
                        });

                        jQuery(window).bind('popstate', function () {
                            _this._state.set('path', getPathFromLocation());
                            _this._onPathChange();
                        });
                    });
                });
            }
        },

        /**
         * Set path to url with history.pushState
         *
         * @param {String} path
         * @param {Boolean} [allowFallback = false] change path with page reload
         *
         * @returns {Boolean} False if history API not supported
         */
        setPath: function (path, allowFallback) {
            return this._changePath.call(this, 'push', path, allowFallback);
        },
        /**
         * Replace current path with history.replaceState
         *
         * @param {String} path
         * @param {Boolean}  [allowFallback = false] change path with page reload
         *
         * @returns {Boolean} False if history API not supported
         */
        replacePath: function (path, allowFallback) {
            return this._changePath.call(this, 'replace', path, allowFallback);
        },

        /**
         * Falback for changing location if browser not support history.pushState or then error was occur while pach is changed
         *
         * @param {Boolean} allowFallback
         * @param {String} path
         * @return {Boolean}
         */
        _fallback: function (allowFallback, path) {
            if (allowFallback) {
                window.location.href = path;
            }
            return false;
        },

        /**
         * Changing windlow.location
         * @override
         * @private
         *
         * @param {String} path
         * @param {Boolean} [allowFallback = false] change path with page reload
         *
         * @returns {Boolean} False if history API not supported
         */
        _changePath: function (method, path, allowFallback) {
            this._state.set('path', path);
            if (!this._historyStateSupported()) {
                return this._fallback(allowFallback, path);
            }

            history[method + 'State'](undefined, undefined, path);
            this._onPathChange();
            return true;
        },

        /**
         * Reloading page
         */
        reload: function (e) {
            if (e) {
                console.error(e);
            }
            setTimeout(function () {
                location.reload();
            });
        },

        /**
         * Handles 404 page
         */
        missing: function () {
            return this.reload();
        },

        /**
         * Handle popstate event from window
         * Process handler for given path
         */
        _onPathChange: function () {
            var currentPath = this.getPath(), handler;

            if (this._lastPath !== currentPath) {
                this._lastPath = currentPath;
                handler = this._prepearRoute();
                BEM.channel('i-router').trigger('update', {path: currentPath});

                if (handler) {
                    this._execHandler(handler)
                        .fail(this.reload)
                        .done();
                } else {
                    this.missing();
                }
            }
        },

        /**
         * Set path and matchers
         * Return handler by new path
         *
         * @param {String} [path] If ommited, then use path from location
         *
         * @return {Object} handler
         */
        _prepearRoute: function (path) {
            var routePath = path || (location.pathname + location.search),
                pathAndSearch = routePath.split('?'),
                pathName = pathAndSearch[0],
                routeInfo = this._getRoute(pathName);

            this._state.set('matchers', (routeInfo) ? routeInfo.matchers : []);
            this._state.set('path', routePath);
            this._readParams(pathAndSearch[1] || '');

            return routeInfo && routeInfo.handler;
        },

        /**
         * Create route handler
         *
         * @override
         * @param {String} blockName
         * @return {Object} handler
         */
        _createHandler: function (blockName) {
            var _this = this;

            return {
                enter: function () {
                    return BEM.blocks[blockName].init(_this._state.get('matchers'));
                },
                update: function () {
                    return BEM.blocks[blockName].update(_this._state.get('matchers'));
                },
                leave: function () {
                    return BEM.blocks[blockName].destruct();
                }
            };
        },

        /**
         * Execute route handler
         *
         * @param {Object} handler route handler
         */
        _execHandler: function (handler) {
            if (handler !== this._lastHandler) {
                var before = this._lastHandler ?
                    Vow.promise(this._lastHandler.leave()) :
                    Vow.fulfill();

                this._lastHandler = handler;
                return before.then(handler.enter);

            } else {
                return handler.update();
            }
        },

        /**
         *
         * Get current host name.
         * @returns {String}
         */
        getHost: function () {
            return location.host;
        },

        /**
         * Get current url params hash
         *
         * @return {Object}
         */
        _readParams: function (search) {
            this._state.set(
                'params',
                String(arguments.length === 1 ? search : location.search)
                    .replace(/^\?/, '')
                    .split('&')
                    .reduce(function (urlParamsObj, keyValue) {
                        var keyValueAr = keyValue.split('=');
                        if (keyValueAr.length === 2) {
                            urlParamsObj[keyValueAr[0]] = decodeURIComponent(
                                keyValueAr[1].replace(/\+/g, ' ')
                            );
                        }
                        return urlParamsObj;
                    }, {})
            );
        },

        /**
         * Sets params to url with history.pushState
         * @param {Object} params
         * @param {Boolean} [allowFallback=false]
         * @param {Boolean} [extend=false] will extend current params
         */
        setParams: function (params, allowFallback, extend) {
            return this._changeParams.call(this, 'set', params, allowFallback, extend);
        },

        /**
         * Replace current params with history.replaceState
         * @param {Object} params
         * @param {Boolean} [allowFallback=false]
         * @param {Boolean} [extend=false] will extend current params
         */
        replaceParams: function (params, allowFallback, extend) {
            return this._changeParams.call(this, 'replace', params, allowFallback, extend);
        },

        /**
         * Change params
         * @param {Object} params
         * @param {Boolean} [allowFallback=false]
         * @param {Boolean} [extend=false] will extend current params
         * @private
         * @returns {*}
         */
        _changeParams: function (method, params, allowFallback, extend) {
            var search = '',
                newParams = params;

            if (extend) {
                newParams = jQuery.extend({}, this.getParams(), params);
            }
            search += jQuery.param(newParams);
            if (location.search === ('?' + search)) {
                return;
            }
            this._state.set('params', params);
            return this[method + 'Path'](location.pathname + (search ? '?' + search : ''), allowFallback);
        },

        /**
         * Return current i-router params as query string
         * @returns {String} something like "?bla=1&name=blabla"
         */
        encodedParams: function () {
            return location.search;
        }

    });

}());
