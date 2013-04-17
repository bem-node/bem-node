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
            data.resource
        ) {
            try {
                data.params = data.params ? JSON.parse(decodeURIComponent(data.params)) : {};
            } catch (err) {
                console.error(err);
                data.params = {};
            }
            //do not parse json and check secret key
            data.requestSource = 'ajax';
            return BEM.blocks[blockName][methodName](
                data.resource,
                data
            ).then(function (json) {
                BEM.blocks['i-response'].json(json);
            }).fail(function (err) {
                if (BEM.blocks['i-api-request'].isHttpError(err)) {
                    BEM.blocks['i-response'].send(err.status, err.message);
                } else {
                    BEM.blocks['i-response'].error(err);
                    throw err;
                }
            });
        } else {
            BEM.blocks['i-response'].missing();
            return this.__base.apply(this, arguments);
        }
    }

});
