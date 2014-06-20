/**
 * Block for create cross client-server block (with fabric method 'create')
 */
var AJAX_KEYWORD = BEM.blocks['i-ajax'].AJAX_KEYWORD;

BEM.blocks['i-router'].define('GET,POST', new RegExp('^\\/' + AJAX_KEYWORD + '(?:\\/([\\w\\-]+)\\/([^_][\\w]+))?\\/?$'), 'i-ajax');

BEM.decl('i-ajax', {}, {
    /**
     * Handler for each request for /api/:block/:method
     * @param {Array} matchers
     * @returns {*}
     */
    init: function (matchers) {
        var _this = this,
            blockName = matchers[1],
            methodName = matchers[2],
            block = BEM.blocks[blockName];

        return this.parseRequestParams()
            .then(function (params) {
                if (!blockName && params.combine) {
                    return _this._combine(params.args)
                        .then(_this.responseData)
                        .fail(_this._errorResponse);
                }
                if (block && block[methodName] && block._allowAjax.indexOf(methodName) !== -1) {
                    return block[methodName].apply(block, params.args || [])
                        .then(_this.responseData)
                        .fail(_this._errorResponse);
                } else {
                    return _this._missingResponse();
                }
            })
            .fail(function (err) {
                return _this._errorResponse(err);
            });
    },

    /**
     * Fabric method for create AJAX blocks
     * @param {Array} ajaxMethods
     * @returns {Object}
     */
    create: function (ajaxMethods) {
        return {
            _allowAjax: ajaxMethods
        };
    },

    /**
     * Parse request parameters
     * @returns {*}
     */
    parseRequestParams: function () {
        var params = BEM.blocks['i-router'].getParams();

        params.args = this._parseArgs(params.args);

        return params.args !== false
            ? Vow.fulfill(params)
            : Vow.reject({status: 400, error: 'Arguments parsing error'});
    },

    /**
     * Response data
     * @param {*} data
     */
    responseData: function (data) {
        return BEM.blocks['i-response'].json({
            response: data.response ? data.response : [{status: 200, data: data}]
        });
    },

    /**
     * Handle missing handler
     * @returns {*}
     * @private
     */
    _missingResponse: function () {
        BEM.blocks['i-response'].missing();
        return Vow.fulfill('');
    },

    /**
     * Handle errors
     * @param {*} err
     * @returns {*}
     * @private
     */
    _errorResponse: function (err) {
        BEM.blocks['i-response'].error(err);
        return Vow.fulfill('');
    },

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
     * Combine requests to API
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
                args = _this._parseArgs(req.args),
                block = BEM.blocks[blockName];

            if (block && block._allowAjax.indexOf(methodName) !== -1) {
                req._blockName = blockName;
                req._methodName = methodName;
                promises.push(block[methodName].apply(block, args || []));
            } else {
                promises.push(new HTTPError(404, 'Method or block not found'));
            }
        });

        return Vow.all(promises).then(function (data) {
            return {
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
            };
        });
    }
});
