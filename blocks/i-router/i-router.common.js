/**
 * Defines request handlers
 *  associates request path with i-block's method
 *
 */
BEM.decl('i-router', null, {

    _state: BEM.blocks['i-state'].initNs('i-router'),

    /**
     * @deprecated
     */
    set: function (key, value) {
        console.error(new Error('i-router.set is deprecated'));
        this.set = this._state.set.bind(this._state);
        this.set(key, value);
        return this;
    },

    /**
     * @deprecated
     */
    get: function (key) {
        console.error(new Error('i-router.get is deprecated'));
        this.get  = this._state.get.bind(this._state);
        return this.get(key);
    },


    /**
     * Returns request uri
     * @returns {String}
     */
    getUri: function () {
        return this.getProtocol() + this.getHost() + this.getPath();
    },

    /**
     * Returns server request object
     * @see http://nodejs.org/api/http.html#http_http_incomingmessage
     */
    getParams: function () {
        return this._state.get('params');
    },

    /**
     * Returns server request object
     * @see http://nodejs.org/api/http.html#http_http_incomingmessage
     */
    getReq: function () {
        return this._state.get('req');
    },

    /**
     * Returns server response object
     * @see http://nodejs.org/api/http.html#http_class_http_serverresponse
     */
    getRes: function () {
        return this._state.get('res');
    },

    /**
     * Returns cookies obj
     * @see https://github.com/defunctzombie/node-cookie
     */
    getCookies: function () {
        return this._state.get('cookies');
    },

    /**
     * Get path, that is pathname & query
     * @returns {String}
     */
    getPath: function () {
        return this._state.get('path').replace(/^\/+/, '/');
    },

    getPathname () {
        var path = this.getPath();

        return path.split('?')[0];
    },

    /**
     * Getting regexp matchers from current router
     * @return {Array}
     */
    getMatchers: function () {
        return this._state.get('matchers');
    },

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
            matchers = [],
            pathNorm = path.replace(/\/{2,}/g, '/');

        this._routeList.some(function (r) {
            if (method && r.reqMethod) {
                if (-1 === r.reqMethod.indexOf(method)) {
                    return false;
                }
            }

            if (typeof (r.reqPath) === 'string') {
                if (pathNorm === r.reqPath) {
                    route = r;
                    return true;
                }
            } else if ((matchers = pathNorm.match(r.reqPath))) {
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
     * Add new path
     *
     * @abstract
     * @param {String} page
     */
    setPath: function () {
        throw new Error('Not implemented');
    },
    /**
     * Replace current path
     *
     * @abstract
     * @param {String} page
     */
    replacePath: function () {
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
    _execHandler: function () {},

    /**
    * @deprecated
    */
    escapeHTML: function (html) {
        console.error(new Error('i-router.escapeHTML deprecated use BN(\'i-content\').escapeHTML()'));
        this.escapeHTML = BEM.blocks['i-content'].escapeHTML;
        return this.escapeHTML(html);
    },

    /**
    * @deprecated
    */
    unescapeHTML: function (text) {
        console.error(new Error('i-router.unescapeHTML deprecated use BN(\'i-content\').unescapeHTML()'));
        this.unescapeHTML = BEM.blocks['i-content'].unescapeHTML;
        return this.unescapeHTML(text);
    }


});
