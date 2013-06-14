/**
 * Common methods for i-router
 *
 */
BEM.decl('i-router', null, {
    /**
     * return allowed params Object
     * @param allowedParams
     * @returns {*}
     * @private
     */
    _allowedParams: function (allowedParams) {
        var params = this.get('params'),
            result = {},
            prop;

        for (prop in params) {
            if (params.hasOwnProperty(prop) && allowedParams.indexOf(prop) > -1) {
                result[prop] = params[prop];
            }
        }
        return result;
    }
});
