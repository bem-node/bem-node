/**
 * Proxy ajax calls on i-blocks
 */

BEM.blocks['i-router'].define('GET,POST', /^\/ajax\/(i[\w\-]+)\/([^_][\w]+)/, 'i-ajax-proxy');

BEM.decl('i-ajax-proxy', {}, {

    _blockList: [],

    /**
     * Allow to proxy blocks
     *
     * @param {String} blockName
     */
    allowBlock: function (blockName) {
        if (blockName.match(/^i/)) {
            this._blockList.push(blockName);
        } else  {
            throw new Error('Only i-blocks allowed to proxy');
        }
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
    /**
     * Response with json
     *
     * @param {Array} matchers
     */
    init: function (matchers) {
        var blockName = matchers[1],
            methodName = matchers[2],
            data = BEM.blocks['i-router'].get('params');
        if (
            this._blockList.indexOf(blockName) !== -1 &&
            BEM.blocks[blockName] &&
            typeof BEM.blocks[blockName][methodName] === 'function' &&
            data &&
            data.resource &&
            (data.params = this._parseJSONParam(data.params))
        ) {
            if (data.resource) {
                data.resource = BEM.blocks['i-router'].unescapeHTML(data.resource);
            }
            if (data.body) {
                data.body = BEM.blocks['i-router'].unescapeHTML(data.body);
            }
            //do not parse json and check secret key
            data.requestSource = 'ajax';
            return BEM.blocks[blockName][methodName](
                data.resource,
                data
            ).then(this._successResponse.bind(this))
             .fail(this._failureResponse.bind(this));
        } else {
            return this._missingResponse();
        }
    }

});
