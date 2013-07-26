/**
 * Read GET|POST data from request
 *
 */
(function () {

    var url = require('url'),
        qs = require('querystring'),
        Cookies = require('cookies');

    BEM.decl('i-router', null, {

        MAX_POST_BODY_SIZE: 1024 * 1024,

        _execHandler: function (handler) {
            var base = this.__base,
                _this = this,
                req = this.get('req');

            this.set('uri', 'http://' + req.headers.host + req.url);
            this._readCookies();
            this._readRequestParams(function (params) {
                _this.set('params', params);
                base.call(_this, handler);
            });
        },

        /**
         * Retrieve cookies and write them to local state
         */
        _readCookies: function () {
            var state = this.get();

            this.set('cookies', new Cookies(state.req, state.res));
        },

        /**
         * Retrieve GET|POST params from request
         *
         * @param {Function} callback
         */
        _readRequestParams: function (callback) {
            var req = this.get('req'),
                _this = this,
                body = '';

            this.set('params', {});

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
                    callback(qs.parse(body));
                }));
            }
        },
        /**
         * Return current i-router params as query string
         * @returns {String} something like "?bla=1&name=blabla"
         */
        encodedParams: function () {
            return '?' + qs.stringify(BEM.blocks['i-router'].get('params'));
        }

    });

}());
