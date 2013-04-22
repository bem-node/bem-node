/**
 * Convert bemjson parts to content
 *
 */
BEM.decl('i-content', null, {

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
