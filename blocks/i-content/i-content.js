/**
 * updting/ appending/ replacing content
 */
BEM.decl('i-content', null,
    /**
     * @param {jQuery} container
     * @param {Object|String} bemJson or string
     *
     * @return {Vow.promise}
     */
    ['update', 'append', 'before', 'replace'].reduce(function (stat, action) {
        stat[action] = function (container, bemJson) {
            return this.html(bemJson)
                .then(function (html) {
                    BEM.DOM[action](container, html);
                });
        };
        return stat;
    }, {})
);