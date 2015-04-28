/**
 * Manages requests and responses
 *  Execute pages with associated request methods and urls
 *
 */
(function () {

    var url = require('url'),
        domain = require('domain'),
        qs = require('querystring'),
        Cookies = require('cookies');

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
                _this._state.set('matchers', (routeInfo) ? routeInfo.matchers : []);
                _this._state.set('req', req);
                _this._state.set('res', res);
                _this._state.set('path', req.url);

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
         * Just execute this.setPath because
         * on server we don't have history's methods
         *
         * @override
         * @param {String} path
         */
        replacePath: function (path) {
            return this.setPath(path);
        },

        /**
         * Create route handler
         *
         * @override
         */
        _createHandler: function (blockName) {
            var _this = this;

            return function () {
                var state = _this._state.get();
                BEM.blocks[blockName].init(state.matchers, state.req, state.res)
                    .fail(function (err) {
                        if (typeof err !== 'undefined') {
                            console.log('Error while routing page ' + state.req.url);
                            BEM.blocks['i-response'].error(err);
                        }
                    }).done();
            };
        },

        MAX_POST_BODY_SIZE: 1024 * 1024,

        /**
         * Execute route handler
         *
         * @param {Function} reqHandler route handler
         */
        _execHandler: function (handler) {
            var _this = this;

            this._readCookies();
            this._readRequestParams(function (params) {
                _this._state.set('params', params);
                handler();
            });
        },

        /**
         * Retrieve cookies and write them to local state
         */
        _readCookies: function () {
            var state = this._state.get();

            this._state.set('cookies', new Cookies(state.req, state.res));
        },

        /**
         * Retrieve GET|POST params from request
         *
         * @param {Function} callback
         */
        _readRequestParams: function (callback) {
            var req = this.getReq(),
                _this = this,
                body = '';

            this._state.set('params', {});

            if (req.method === 'GET') {
                callback(url.parse(req.url, true).query);
            } else if (req.method === 'POST') {
                req.on('data', BEM.blocks['i-state'].bind(function (chunk) {
                    body += chunk.toString();
                    if (body.length > _this.MAX_POST_BODY_SIZE) {
                        body = '';
                        _this._error(new Error('Request body too large'));
                        req.connection.destroy();
                        process.domain.dispose();
                    }
                }));
                req.on('end', BEM.blocks['i-state'].bind(function () {
                    if (req.headers['content-type'] === 'application/json') {
                        callback(body);
                    } else {
                        callback(qs.parse(body));
                    }
                }));
            }
        },
        /**
         * Return current i-router params as query string
         * @returns {String} something like "?bla=1&name=blabla"
         */
        encodedParams: function () {
            return '?' + qs.stringify(this.getParams());
        },


        /**
         * Get host name for current request.
         * Hostname is taken from HOST header
         * @returns {String|undefined} reuturn hostname or undefined,
         * if HOST header is missing
         */
        getHost: function () {
            return this._state.get('req').headers.host;
        }


    });

    BEM.blocks['i-router'].init();

}());
