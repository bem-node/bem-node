/**
 * Block for create cross client-server block (with fabric method 'create')
 */
var AJAX_KEYWORD = BEM.blocks['i-ajax'].AJAX_KEYWORD;
var HttpError = BEM.blocks['i-errors'].HttpError;


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
                args = _this._parseArgs(req.data.args),
                block = BEM.blocks[blockName];

            if (block && ~block._allowAjax.indexOf(methodName)) {
                req._blockName = blockName;
                req._methodName = methodName;
                promises.push(block[methodName].apply(block, args || []));
            } else {
                promises.push(new HttpError(404));
            }
        });

        return Vow.allResolved(promises).then(function (data) {
            return data.map(function (res) {
                if (Vow.isPromise(res)) {
                    if (res.isRejected()) {
                        return {
                            error: BEM.blocks['i-errors'].serialize(res.valueOf())
                        };
                    } else {
                        return {
                            result: res.valueOf()
                        };
                    }
                } else {
                    return {
                        result: res
                    };
                }
            });
        });
    },

    /**
     * Response with data as 'response' property of JSON response
     * @param {Object} data
     */
    _responseData: function (data) {
        BEM.blocks['i-response'].json({response: data});
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

