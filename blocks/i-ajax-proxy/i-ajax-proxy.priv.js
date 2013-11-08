/**
 * Proxy ajax calls on i-blocks
 */

BEM.blocks['i-router'].define('GET,POST', /^\/ajax\/([\w\-]+)\/([^_][\w]+)/, 'i-ajax-proxy');

BEM.decl('i-ajax-proxy', {}, {

    _blockList: [],

    /**
     * Allow to proxy blocks
     *
     * @param {String} blockName
     */
    allowBlock: function (blockName) {
        this._blockList.push(blockName);
    },

    _parseJSONParam: function (str) {
        try {
            if (str) {
                return JSON.parse(decodeURIComponent(BEM.blocks['i-router'].unescapeHTML(str)));
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

    _checkMethod: function (blockName, methodName) {

        return this._blockList.indexOf(blockName) !== -1 &&
            BEM.blocks[blockName] &&
            typeof BEM.blocks[blockName][methodName] === 'function';
    },

    _runMethod: function (blockName, methodName, data) {
        //do not parse json and check secret key
        data.requestSource = 'ajax';
        data.params = this._parseJSONParam(data.params);
        data.resource = BEM.blocks['i-router'].unescapeHTML(data.resource);

        if (data.body) {
            data.body = BEM.blocks['i-router'].unescapeHTML(data.body);
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
