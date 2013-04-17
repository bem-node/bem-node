/**
 * Defines request handlers
 *  associates request path with i-block's method
 *
 */
BEM.decl('i-router', null, BEM.blocks['i-state'].initNs('i-router'));
BEM.decl('i-router', null, {

    /**
     * List of allowed http methods
     *
     * @const
     * @type {Array}
     */
    REQUEST_METHODS: ['GET', 'POST', 'PUT', 'DELETE'],

    /**
     * List of registered routes
     *
     * @type {Array}
     */
    _routeList: [],

    /**
     * Define handler or list of handlers
     *
     * @param [{String|Array} reqMethod request method: 'get', 'post', 'get,post', 'delete' etc. or list of arguments
     *  To assign more than one method list with comma]
     * @param {String|RegExp} reqPath request path matcher
     * @param {String} blockName block name
     */
    define: function (reqMethod, reqPath, blockName) {
        if (Array.isArray(reqMethod) && !reqPath) {
            reqMethod.forEach(function (routeDefn) {
                this.define.apply(this, routeDefn);
            }, this);

            return;
        }

        if (blockName) {
            reqMethod = reqMethod.toUpperCase();
            reqMethod.split(',').every(function (method) {
                if (-1 === this.REQUEST_METHODS.indexOf(method)) {
                    throw new Error('Unexpected request method: ' + method);
                }
                return true;
            }, this);
        } else {
            blockName = reqPath;
            reqPath = reqMethod;
            reqMethod = false;
        }

        this._routeList.push({
            reqMethod: reqMethod,
            reqPath: reqPath,
            reqHandler: this._createHandler(blockName)
        });
    },

    /**
     * Get route by request path and method
     *
     * @param {String} path requested path
     * @param [{String} method request method (GET, POST ...)]
     * @return {Object} routeInfo
     * @return {Function} .handler request handler
     * @return {Array} .matchers
     */
    _getRoute: function (path, method) {
        var route,
            matchers = [];

        this._routeList.some(function (r) {
            if (method && r.reqMethod) {
                if (-1 === r.reqMethod.indexOf(method)) {
                    return false;
                }
            }

            if (typeof (r.reqPath) === 'string') {
                if (path === r.reqPath) {
                    route = r;
                    return true;
                }
            } else if ((matchers = path.match(r.reqPath))) {
                route = r;
                return true;
            }

            return false;
        });

        return route ? {
            handler: route.reqHandler,
            matchers: matchers || []
        } : null;
    },

    /**
     * Changing path
     *
     * @abstract
     * @param {String} page
     */
    setPath: function () {
        throw new Error('Not implemented');
    },

    /**
     * Create route handler
     *
     * @abstract
     * @param {String} blockName block name
     * @return {Mixed} request handler
     */
    _createHandler: function () {},

    /**
     * Execute route handler
     *
     * @abstract
     * @param {Mixed} reqHandler request handler created by i-router._createHandler
     */
    _execHandler: function () {}

});
