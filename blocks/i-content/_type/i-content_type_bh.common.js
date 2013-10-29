/**
 * Convert bemjson parts to content with bh
 * @see
 */
BEM.decl('i-content', null, {

    _htmlAsync: function (json) {
        var __base = this.__base.bind(this);
        return BEM.blocks['i-bh'].bh().processBemJsonAsync(json).then(function () {
            return __base(json);
        });
    },

    _htmlSync: function (json) {
        return this.__base(BEM.blocks['i-bh'].bh().processBemJson(json));
    }

});
