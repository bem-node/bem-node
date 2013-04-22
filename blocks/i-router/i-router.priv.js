/**
 * Manages requests and responses
 *  Execute pages with associated request methods and urls
 *
 */
(function () {

    var url = require('url'),
        domain = require('domain');

    BEM.decl('i-router', null, {

        /**
         * Init i-router
         */
        init: function () {
            try {
                BEM.blocks['i-www-server'].setRequestHandler(this._onRequest.bind(this));
            } catch (ex) {
                throw new Error('Unable to init router: invalid server specified?');
            }
        },

        /**
         * Handles 50x page
         *
         * @note will be called from domain
         * @param {Error} err
         */
        _error: function (err) {
            var routeInfo = this._getRoute('500');
            if (routeInfo) {
                this._execHandler(routeInfo.handler);
            } else {
                BEM.blocks['i-response'].error(err);
            }
        },

        /**
         * Handles 404 page
         *
         * @note will be called from domain
         */
        missing: function () {
            var routeInfo = this._getRoute('404');

            if (routeInfo) {
                this._execHandler(routeInfo.handler);
            } else {
                BEM.blocks['i-response'].missing();
            }
        },

        /**
         * Handle request from http.Server
         *
         * @param {http.ServerRequest} req
         * @param {http.ServerResponse} res
         */
        _onRequest: function (req, res) {
            var routeInfo = this._getRoute(url.parse(req.url).pathname, req.method),
                reqDomain = domain.create(),
                _this = this;

            reqDomain.run(function () {
                _this.set('matchers', (routeInfo) ? routeInfo.matchers : [])
                    .set('req', req)
                    .set('res', res);

                reqDomain.on('error', function (err) {
                    _this._error(err);
                    res.on('close', function () {
                        reqDomain.dispose();
                    });
                });

                if (routeInfo) {
                    _this._execHandler(routeInfo.handler);
                } else {
                    _this.missing();
                }
            });
        },

        /**
         * Changing path
         *
         * @override
         * @param {String} path
         */
        setPath: function (path) {
            return BEM.blocks['i-response'].redirect(path);
        },

        /**
         * Create route handler
         *
         * @override
         */
        _createHandler: function (blockName) {
            var _this = this;

            return function () {
                var state = _this.get();
                BEM.blocks[blockName].init(state.matchers, state.req, state.res)
                    .fail(function (err) {
                        console.log('Error while routing page ' + state.req.url);
                        console.error(err);
                    }).done();
            };
        },

        /**
         * Execute route handler
         *
         * @param {Function} reqHandler route handler
         */
        _execHandler: function (reqHandler) {
            reqHandler();
        }

    });

}());
