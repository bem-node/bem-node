/**
 * Client's implementation of base class for a page
 *
 * @abstract
 */
BEM.decl('i-page', null, {

    /**
     * Called when page params changed
     *
     * @param {Array} matchers matched params from path
     * @return {Vow.promise}
     */
    update: function (matchers) {
        return this.init.apply(this, arguments);
    },

    /**
     * Called when leaving current page
     *
     * @return {Vow.promise}
     */
    destruct: function () {
        return Vow.fulfill();
    },

    /**
     * Set html title for page
     *
     * @override
     * @param {String} title page title
     * @return {i-page}
     */
    setTitle: function (title) {
        var oldTitleNode = jQuery('title'),
            newTitle = jQuery('<title>' + title + '</title>');

        if (oldTitleNode) {
            newTitle.insertBefore(oldTitleNode);
            oldTitleNode.remove();
        } else {
            newTitle.prependTo('head');
        }

        return this;
    },

    /**
     * Set html description meta tag for page
     *
     * @override
     * @param {String} text description content
     * @return {i-content}
     */
    setDescription: function (text) {
        jQuery('meta[name=description]').attr('content', text);
        return this;
    },

    /**
     * What node will be updated after page is changed
     * @return {jQuery} node
     */
    getUpdateNode: function () {
        return jQuery('.b-content');
    },

    /**
     * Process bemjson and bemhtml then update `b-content` with generated html
     *
     * @override
     * @param {String|Object|Array} json
     * @return {Vow.promise}
     */
    out: function (json) {
        return this.html(json).then(function (html) {
            try {
                BEM.DOM.update(
                    this.getUpdateNode(),
                    html
                );
            } catch (ex) { console.error(ex); }
            jQuery('body, html').scrollTop(0);
            return html;
        }.bind(this));
    }

});
