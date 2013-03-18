BEM.decl('i-page', null, {

    /**
     * Process bemjson and bemhtml then output generated html
     * @override
     * @param {Mixed} json
     */
    out: function (json) {
        var res = BEM.blocks['i-router'].get('res');
        
        return this.html({
            block: 'b-page',
            content: [
                {block: 'b-head', content: 'head'},
                {block: 'b-content', content: json},
                {block: 'b-foot', content: 'foot'}
            ],
            head: [

            ]
        }).then(function (html) {
            res.end(html);
        });
    }
});
