BEM.decl('i-page', null, {

    _state: BEM.blocks['i-state'].initNs('i-page'),

    /**
     * Setting in state
     *
     * @deprecated since 0.7.0
     */
    set : function (key, val) {
        console.error('method "set" of i-page is deprecated');
        this._state.set(key, val);
    },

    /**
     * Getting from state
     *
     * @deprecated since 0.7.0
     */
    get: function (key) {
        console.error('method "get" of i-page is deprecated');
        this._state.get(key);
    },

    /**
     * Process bemjson and bemhtml then output generated html
     * @override
     * @param {Mixed} json
     */
    out: function (json) {
        var _this = this,
            bemJson = _this.getPageJson(json);

        return Vow.fulfill(_this.extendPageJson(bemJson)).then(function (bemJson) {
            return _this.html(bemJson).then(function (html) {
                BEM.blocks['i-response'].send(200, html, 'text/html');
            });
        });
    },

    /**
     * @deprecated since 0.7.0. not forking now
     */
    beforeOut: function () {
        console.error('"beforeOut" is deprecated; Redefine i-page on yours level');
    },

    /**
     * Extending page json by adding params like "head" "meta" etc
     *
     * @param {Object} json
     * @return {Vow.promise|Object}
     */
    extendPageJson: function (json) {
        return jQuery.extend(this._getPageParams(), json);
    },

    /**
     * Default bemjson for all pages
     *
     * @param {Mixed} json
     *
     * @return {Object} bemjson
     */
    getPageJson: function (json) {
        if (this.hasOwnProperty('getJson')) {
            console.log('getJson method of block "i-page" is deprecated. Rename it to getPageJson');
            return this.getJson(json);
        }
        return {
            block: 'b-page',
            content: [
                {block: 'b-content', content: json}
            ]
        };
    },

    /**
     * Set html title for page
     *
     * @override
     * @param {String} title page title
     * @return {i-page}
     */
    setTitle: function (title) {
        this._setPageParams('title', title);
        return this;
    },

    /**
     * Set html description meta tag
     *
     * @override
     * @param {String} text description content
     * @return {i-page}
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
     * @return {i-page}
     */
    setMeta: function (name, content) {
        var params = this._getPageParams(),
            head = params && params.head || [],
            meta;

        head.some(function (item) {
            if (item && item.elem === 'meta' && item.attrs.name === name) {
                meta = item;
                return true;
            }
        });

        if (meta) {
            meta.attrs.content = content;
        } else {
            head.push({
                elem: 'meta',
                attrs: {
                    name: name,
                    content: content
                }
            });
            this._setPageParams('head', head);
        }

        return this;
    },

    /**
     * Add tag into head of page
     *
     * @param {Object|String} bemjson or tag in string
     * @return {i-page}
     */
    addToHead: function (elem) {
        var head = this._getPageParams().head || [];
        head.push(elem);
        this._setPageParams('head', head);
        return this;
    },

    _getPageParams: function () {
        var params = this._state.get('b-page');
        if (!params) {
            params = {};
            this._state.set('b-page', params);
        }
        return params;
    },

    _setPageParams: function (name, value) {

        if (value === undefined) {
            this._state.set('b-page', name);
        } else {
            this._state.set('b-page.' + name, value);
        }
    }

});
