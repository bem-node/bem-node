/**
 * Convert bemjson parts to content with bh
 * @see
 */
BEM.decl('i-content', null, {

    /**
     * @override
     */
    html: function (bemJson, isSync) {
        if (!Array.isArray(bemJson)) {
            bemJson = [bemJson];
        }
        return (isSync) ? this._htmlSync(bemJson) : this._htmlAsync(bemJson);
    },

    /**
     * @override
     */
    _htmlAsync: function (json) {
        return BEM.blocks['i-bh'].bh().processBemJsonAsync(json).then(function (expandedJson) {
            return BEMHTML.call(expandedJson);
        });
    },

    /**
     * @override
     */
    _htmlSync: function (json) {
        return BEMHTML.call(BEM.blocks['i-bh'].bh().processBemJson(json));
    }

});
