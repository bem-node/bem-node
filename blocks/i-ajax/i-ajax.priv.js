/**
 * Block for create cross client-server block (with fabric method 'create')
 */
var AJAX_KEYWORD = BEM.blocks['i-ajax'].AJAX_KEYWORD;

BEM.blocks['i-router'].define('GET,POST', new RegExp('^\\/' + AJAX_KEYWORD + '(?:\\/([\\w\\-]+)\\/([^_][\\w]+))?\\/?$'), 'i-ajax');

BEM.decl('i-ajax', {}, {
    /**
     * Parse incoming arguments
     * @param args
     * @returns {*}
     * @private
     */
    _parseArgs: function (args) {
        try {
            return JSON.parse(args);
        } catch (e) {}
        return false;
    },

    /**
     *
     * @param {Array} reqs
     * @returns {*}
     */
    _combine: function (reqs) {
        var promises = [],
            _this = this;

        reqs.forEach(function (req) {
            var matchers = req.url.match(new RegExp('^\\/' + AJAX_KEYWORD + '\\/([\\w\\-]+)\\/([^_][\\w]+)?\\/?$')),
                blockName = matchers[1],
                methodName = matchers[2],
                HTTPError = BEM.blocks['i-http']._HttpError,
                args = _this._parseArgs(req.data.args),
                block = BEM.blocks[blockName];

            if (block && ~block._allowAjax.indexOf(methodName)) {
                req._blockName = blockName;
                req._methodName = methodName;
                promises.push(block[methodName].apply(block, args || []));
            } else {
                promises.push(new HTTPError(404, 'Method or block not found'));
            }
        });

        return Vow.all(promises).then(function (data) {
            BEM.blocks['i-response'].json({
                response: data.map(function (res, i) {
                    var isHttpError = BEM.blocks['i-http'].isHttpError(res.valueOf());
                    if (Vow.isPromise(res) && res.isRejected()) {
                        return {
                            status: isHttpError ? res.valueOf().status : 500,
                            error: isHttpError ? res.valueOf().message : 'Error with ' + reqs[i]._blockName + ' method ' + reqs[i]._methodName
                        };
                    }
                    return {
                        status: 200,
                        data: res
                    };
                })
            });
        });
    },

    /**
     * Response with data as 'data' property of JSON response
     * @param {Object} data
     */
    _responseData: function (data) {
        BEM.blocks['i-response'].json({data: data});
    },

    /**
     * Handler for each request for /api/:block/:method
     * @returns {*}
     */
    init: function () {
        var args = this._parseArgs(BEM.blocks['i-router'].getParams().args);

        return this._combine(args).then(this._responseData);
    }
});

