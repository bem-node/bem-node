BEM.decl('i-page', null, {
    
    /**
     * Process bemjson and bemhtml then output generated html
     * @override
     * @param {Mixed} json
     */
    out: function (json) {
        var res = BEM.blocks['i-router'].get('res');
        return this.html(this.getJson(json)).then(function (html) {
            res.end(html);
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
        return {
            block: 'b-page',
            content: [
                {block: 'b-content', content: json},
            ]
        }
    }
});
