/**
 * Proxy ajax calls on i-blocks
 */

BEM.blocks['i-router'].define('GET,POST', /^\/ajax\/([\w\-]+)\/([^_][\w]+)/, 'i-ajax-proxy');

BEM.decl('i-ajax-proxy', {}, {

    WILDCARD: '*',

    _allowedRequests: {},

    /**
     * Allow to proxy blocks
     *
     * @param {String} blockName
     * @param [String = *] methodName
     * @param [Array<String, RegExp> = *] resources
     */
    allowBlock: function (blockName, methodName, resources) {
        var policy = {};
        policy[blockName] = {};
        policy[blockName][methodName || this.WILDCARD] = resources || [this.WILDCARD];
        jQuery.extend(true, this._allowedRequests, policy);
    },

    _parseJSONParam: function (str) {
        try {
            if (str) {
                return JSON.parse(decodeURIComponent(BEM.blocks['i-content'].unescapeHTML(str)));
            } else {
                return {};
            }
        } catch (err) {
            console.log(err);
            return false;
        }
    },
    /**
     * Create and send response to client
     * @param data
     * @param json
     * @private
     */
    _successResponse: function (json) {
        BEM.blocks['i-response'].json(json);
    },
    /**
     * Handle error
     * @param err
     * @private
     */
    _failureResponse: function (err) {
        if (BEM.blocks['i-api-request'].isHttpError(err)) {
            BEM.blocks['i-response'].send(err.status, err.message);
        } else {
            BEM.blocks['i-response'].error(err);
            throw err;
        }
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

    _accessPolicies: [
        //allowed block
        function (blockName) {
            return this._allowedRequests[blockName];
        },
        // allowed method
        function (blockName, methodName) {
            var blockData = this._allowedRequests[blockName];
            return blockData[methodName] || blockData[this.WILDCARD];
        },
        // method is a function
        function (blockName, methodName) {
            return typeof BEM.blocks[blockName][methodName] === 'function';
        },
        // allowed resources
        function (blockName, methodName, data) {
            var blockData = this._allowedRequests[blockName];

            return [blockData[methodName], blockData[this.WILDCARD]].some(function (methodData) {
                return methodData && methodData.some(function (needle) {
                    if (needle === this.WILDCARD) {
                        return true;
                    } else if (needle instanceof String) {
                        return data.resource === needle;
                    } else if (needle instanceof RegExp) {
                        return data.resource.match(needle);
                    }
                }, this);
            }, this);
        }
    ],
    _checkMethod: function (blockName, methodName, data) {
        return this._accessPolicies.every(function (policy) {
            return policy.call(this, blockName, methodName, data);
        }, this);
    },

    _runMethod: function (blockName, methodName, data) {
        //do not parse json and check secret key
        data.requestSource = 'ajax';
        data.params = this._parseJSONParam(data.params);
        data.resource = BEM.blocks['i-content'].unescapeHTML(data.resource);

        if (data.body) {
            data.body = BEM.blocks['i-content'].unescapeHTML(data.body);
        }

        return BEM.blocks[blockName][methodName](
            data.resource,
            data
        );
    },

    /**
     * Response with json
     *
     * @param {Array} matchers
     */
    init: function (matchers) {
        var blockName = matchers[1],
            methodName = matchers[2],
            data = BEM.blocks['i-router'].getParams();

        if (this._checkMethod(blockName, methodName, data)) {
            return this._runMethod(blockName, methodName, data)
                .then(this._successResponse.bind(this))
                .fail(this._failureResponse.bind(this));
        } else {
            return this._missingResponse();
        }
    }

});
