/**
 * Process path and query params changes to defined pages
 *
 */
(function () {

    /**
     * Some browsers pops state on load, we'll process popState only if location or state were changed before
     */
    var initialUrl = location.href,
        wasChanged = false;

    BEM.decl('i-router', null, {

        /**
         * Init i-router
         */
        init: function () {
            var _this = this;

            this._lastHandler = this._prepearRoute();
            if (history.pushState) {
                jQuery(document).delegate('a', 'click', function (e) {
                    if (!e.metaKey && !e.ctrlKey && this.protocol === location.protocol && this.host === location.host) {
                        if (_this.setPath(this.pathname + this.search)) {
                            e.preventDefault();
                        }
                    }
                });

                jQuery(window).bind('popstate', function () {
                    if (wasChanged || location.href !== initialUrl) {
                        _this._onPathChange();
                    }
                    wasChanged = true;
                });
            }
        },

        /**
         * Changing windlow.location
         * @override
         * @param {String} path
         * @param {Boolean} [allowFallback = false] change path with page reload
         */
        setPath: function (path, allowFallback) {
            if (this.get('path') === path) {
                return true;
            }

            try {
                this._onPathChange(path);
                history.pushState(undefined, undefined, path);
            } catch (ex) {
                if (allowFallback) {
                    window.location.href = path;
                } else {
                    console.error(ex);
                }
                return false;
            }
            wasChanged = true;
            return true;
        },

        /**
         * Handles 404 page
         *
         * @todo-mdidkivskyi: display 404 page .. ?
         */
        _missing: function () {
            throw new Error('Page not fouund.');
        },

        /**
         * Handle popstate event from window
         * Process handler for given path
         *
         * @param {String} path new path to route
         */
        _onPathChange: function (path) {
            var handler = this._prepearRoute(path);

            BEM.channel('i-router').trigger('update', {path: path});
            if (handler) {
                this._execHandler(handler);
            } else {
                this._missing();
            }
        },

        /**
         * Set path and matchers
         * Return handler by new path
         *
         * @param {String} [path] new path to route. if not given, will be taken from location
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
                    BEM.blocks[blockName].init(_this.get('matchers')).done();
                },
                update: function () {
                    BEM.blocks[blockName].update(_this.get('matchers')).done();
                },
                leave: function () {
                    BEM.blocks[blockName].destruct().done();
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
                if (this._lastHandler) {
                    this._lastHandler.leave();
                }
                handler.enter();
                this._lastHandler = handler;
            } else {
                handler.update();
            }
        }

    });

}());
