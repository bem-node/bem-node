BEM.decl('i-page', null, {

    /**
     * Process bemjson and bemhtml then output generated html
     * @override
     * @param {Mixed} json
     */
    out: function (json) {
        return this.html(this.getJson(json)).then(function (html) {
            BEM.blocks['i-response'].send(200, html, 'text/html');
        });
    },

    /**
     * Default bemjson for all pages
     *
     * @param {Mixed} json
     *
     * @return {Object} bemjson
     */
    getJson: function (json) {
        return jQuery.extend(this._getParams(), {
            block: 'b-page',
            content: [
                {block: 'b-content', content: json},
            ]
        });
    }

});
