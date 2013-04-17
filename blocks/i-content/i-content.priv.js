/**
 * Convert bemjson parts to content
 *
 */
BEM.decl('i-content', null, BEM.blocks['i-state'].initNs('i-content'));
BEM.decl('i-content', null, {

    /**
     * Process bemjson and bemhtml then output generated html
     *
     * @override
     * @param {String|Object|Array} bemJson
     * @return {Vow.promise}
     */

    /**
     * Set html title for page
     *
     * @override
     * @param {String} title page title
     * @return {i-content}
     */
    setTitle: function (title) {
        this._setParams('title', title);
        return this;
    },

    /**
     * Set html description meta tag
     *
     * @override
     * @param {String} text description content
     * @return {i-content}
     */
    setDescription: function (text) {
        return this.setMeta('description', text);
    },

    /**
     * Set content for meta tag
     *
     * @override
     * @param {String} name name of a meta tag
     * @param {String} content content for given meta tag
     * @return {i-content}
     */
    setMeta: function (name, content) {
        var params = this._getParams(),
            meta = params && params.meta || [],
            tag;

        meta.some(function (t) {
            if (t.attrs.name === name) {
                tag = t;
                return true;
            }
        });

        if (tag) {
            tag.attrs.content = content;
        } else {
            meta.push({
                tag: 'meta',
                attrs: {
                    name: name,
                    content: content
                }
            });
            this._setParams('meta', meta);
        }

        return this;
    },

    _getParams: function () {
        return this.get('b-page') || {};
    },

    _setParams: function (name, value) {
        if (value === undefined) {
            this.set('b-page', name);
        } else {
            this.set('b-page.' + name, value);
        }
    }

});
