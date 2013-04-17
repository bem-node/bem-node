/**
 * Convert bemjson parts to content
 *
 */
BEM.decl('i-content', null, {

    /**
     * Process bemjson and bemhtml then update `b-content` with generated html
     *
     * @override
     * @param {String|Object|Array} bemJson
     * @return {Vow.promise}
     */
    /*out: function (bemJson) {
        jQuery('html, body').animate({scrollTop: 0}, 300);
        return this.html(bemJson).then(function (html) {
            try {
                BEM.DOM.update(
                    jQuery('.b-content__wrap'),
                    html
                );
            } catch (ex) { console.error(ex); }
        });
    },*/

    /**
     * Set html title for page
     *
     * @override
     * @param {String} title page title
     * @return {i-content}
     */
    setTitle: function (title) {
        var titleNode = jQuery('title');

        jQuery('<title>' + title + '</title>').insertBefore(titleNode);
        titleNode.remove();

        return this;
    }

});
