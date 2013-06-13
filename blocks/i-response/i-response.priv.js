/**
 * Manages error pages (404, 50x), http redirect and responses
 *
 */
BEM.decl('i-response', null, {

    STATUS_CODES: require('http').STATUS_CODES,

    /**
     * Send arbitary response
     *
     * @param {Number} status
     * @param {String} body
     * @param {String} [contentType=text/plain]
     */
    send: function (status, body, contentType) {
        var res = this._getResponse();

        if (res.finished) {
            console.log('Cannot finish response. It is already finished.');
        } else {
            contentType = contentType || 'text/plain';
            try {
                res.writeHead(status, {
                    'Content-Type': contentType + '; charset=utf-8',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY'
                });
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
     * Shorthand mathod for accessing http.response
     *
     * @return {http.ServerResponse}
     */
    _getResponse: function () {
        return BEM.blocks['i-router'].get('res');
    }

});
