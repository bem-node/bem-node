/**
 * Process path and query params changes to defined pages
 *
 */
(function () {

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

            this._lastPath = this.getPath();
            this._lastHandler = this._prepearRoute(this._lastPath);
            if (this._historyStateSupported()) {
                // Subscribe to popstate after 'load' event
                // to tackle bug in Chrome with 'popstate' on load
                jQuery(window).one('load', function () {
                    setTimeout(function () {
                        jQuery(document).delegate('a', 'click', function (e) {
                            if (!e.metaKey && !e.ctrlKey && this.protocol === location.protocol && this.host === location.host) {
                                if (_this.setPath(this.pathname + this.search + this.hash)) {
                                    e.preventDefault();
                                }
                            }
                        });

                        jQuery(window).bind('popstate', function () {
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
        reload: function () {
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

            this.set('matchers', (routeInfo) ? routeInfo.matchers : [])
                .set('path', routePath)
                ._readParams(pathAndSearch[1] || '');

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
                    return BEM.blocks[blockName].init(_this.get('matchers'));
                },
                update: function () {
                    return BEM.blocks[blockName].update(_this.get('matchers'));
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
         *
         * Get current uri
         * @returns {String}
         */
        getUri: function () {
            return location.href;
        },

        /**
         * Get path, that is pathname & query
         * @returns {String}
         */
        getPath: function () {
            return location.pathname + location.search;
        }

    });

}());
