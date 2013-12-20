/**
 * Manages error pages (404, 50x), http redirect and responses
 *
 */
BEM.decl('i-response', null, {

    STATUS_CODES: require('http').STATUS_CODES,

    /**
     * Default response headers
     * @param {Number} status
     * @param {String|Buffer} body
     * @param {String} contentType
     */
    _getResponseHeaders: function (status, body, contentType) {
        return {
            'Content-Type': contentType + '; charset=utf-8',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
        };
    },

    /**
     * Send arbitary response
     *
     * @param {Number} status
     * @param {String} body
     * @param {String} [contentType=text/plain]
     */
    send: function (status, body, contentType) {
        var res = this._getResponse(),
            savedStatusCode = BEM.blocks['i-state'].get('i-response.statusCode');

        if (res.finished) {
            console.log('Cannot finish response. It is already finished.');
        } else {
            contentType = contentType || 'text/plain';
            try {
                res.writeHead(savedStatusCode || status, this._getResponseHeaders.apply(this, arguments));
                res.end(body);
            } catch (err) {
                console.error(err);
            }
        }
    },

    /**
     * Response with json
     *
     * @param {String|Object} json
     */
    json: function (json) {
        var outputJson;
        if (typeof json === 'object') {
            outputJson = JSON.stringify(json);
        } else {
            outputJson = String(json);
        }
        this.send(200, outputJson, 'application/json');
    },

    /**
     * Redirect to given uri
     *
     * @param {String} path location to redirect to
     */
    redirect: function (path) {
        var res = this._getResponse();
        res.writeHead(302, {'Location': path});
        res.end();
    },

    /**
     * @todo move to i-router
     * Response 404
     */
    missing: function () {
        var res = this._getResponse();
        res.writeHead(404, this.STATUS_CODES[404]);
        res.end();
    },

    /**
     * Response 503 error
     *
     * @param {Error} err
     */
    error: function (err) {
        var res = this._getResponse(),
            statusCode = err.status || 503,
            message = err.message || this.STATUS_CODES[statusCode];
        console.error(err);
        res.writeHead(statusCode, message);
        res.end();
    },

    /**
     * Change statusCode of current response
     * @param {Number} statusCode
     */
    setStatus: function (statusCode) {
        BEM.blocks['i-state'].set('i-response.statusCode', statusCode);
    },

    /**
     * Shorthand mathod for accessing http.response
     *
     * @return {http.ServerResponse}
     */
    _getResponse: function () {
        return BEM.blocks['i-router'].getRes();
    }

});
