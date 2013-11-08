/**
 * Convert bemjson parts to content
 *
 */
(function () {
    var error = new Error('You should add {block: \'i-content\', mods: {type: 'bemhtml'}} into .bemdecl.js file to use bemhtml templates or some other type you want');

    BEM.decl('i-content', null, {

        /**
         * Process given bemjson to html
         *
         * @abstract
         *
         * @param {String|Object|Array} bemJson
         * @param {Boolean} [isSync] if true, method will perform synchronous BEM.JSON.build and return a html string
         * @return {Vow.promise|String}
         */
        html: function () {
            throw error;
        },

        /**
         * @abstract
         */
        _htmlSync: function () {
            throw error;
        },

        /**
         * @abstract
         */
        _htmlAsync: function () {
            throw error;
        },

        /**
        * Escape html special chars
        *
        * @param {String} html
        * @return {String} text
        */
        escapeHTML: function (html) {
            return String(html)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        },

        /**
        * Unescape html special chars
        *
        * @param {String} text
        * @return {String} html
        */
        unescapeHTML: function (text) {
            return String(text)
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, '\'')
                .replace(/&#x2F;/g, '/');
        }

    });

}());

