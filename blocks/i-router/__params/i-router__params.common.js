/**
 * Escaping and unescaping
 */
BEM.decl('i-router', null, {

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
