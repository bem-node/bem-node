BEM.decl('i-ajax', {}, {
    /**
     * @override Translate array of cache objects to String[]
     * @param {Array} ajaxMethods
     * @returns {Object}
     */
    create: function (ajaxMethods) {
        ajaxMethods = ajaxMethods.map(function (method) {
            if (typeof method === 'object') {
                return method.name;
            }
            return method;
        });

        return {
            _allowAjax: ajaxMethods
        };
    }
});
