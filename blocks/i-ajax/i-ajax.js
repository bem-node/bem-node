/**
 * Block for create cross client-server block (with fabric method 'create')
 */
(function () {
    var AJAX_KEYWORD = BEM.blocks['i-ajax'].AJAX_KEYWORD,
        HTTPError = BEM.blocks['i-http'].HttpError,

        /**
         * @typedef {Object} AjaxParams
         * @property {String} url
         * @property {Object} data
         * @property {Number} data.ts
         * @property {Array|String} data.args
         */

        /**
         * Store data for requests
         * @param {String} method - name of invoking method
         * @param {AjaxParams} ajaxParams - params for ajax request with args
         * @param {Promise} promise - request promise
         * will be fulfilled when method sent properly response or rejected otherwise
         * @constructor
         */
        Request = function (method, ajaxParams, promise) {
            this.method = method;
            this.ajaxParams = ajaxParams;
            this.promise = promise;
        },

        /**
         * Constructor for additional params for ajax request
         * @constructor
         */
        RequestOptions = function () {
            this.data = {};
            this.headers = {};
        };


    /**
     * Serialize arguments for transporting
     */
    Request.prototype.prepareArgs = function () {
        this.args(JSON.stringify(Array.prototype.slice.call(this.args())));
    };

    /**
     * Getter for arguments
     * @returns {Arguments|Array|String} current args for method
     *//**
     * Setter for arguments
     * @param {Arguments|Array|String} [val]
     * @returns {Request}
     */
    Request.prototype.args = function (val) {
        if (val) {
            this.ajaxParams.data.args = val;
            return this;
        }
        return this.ajaxParams.data.args;
    };

    BEM.decl('i-ajax', {}, {
        /**
         * RPC method decorator
         * @typedef {Function} Decorator
         * @param {String} methodName - method that invoked
         * @param {Array|Arguments} args - stored arguments that will be
         * passed to invoked method on server
         * @param {RequestOptions} requestOptions - will be added to jQuery.ajax
         * @returns {Promise}
         */

        /**
         * Decorators are functions that applied for each request
         * Any decorator should return promise
         * @type {Array.<Decorator>}
         * @protected
         */
        _decorators: [],

        _TIMEOUT: 25000,

        /**
         * Turn on\off debounce
         * @protected
         */
        _requestDebounce: true,

        _requestQueue: [],

        /**
         * Execute decorators for request and return
         * @param {Request} request
         * @param {RequestOptions} requestOptions
         * @returns {Promise}
         */
        _executeDecorators: function (request, requestOptions) {
            var promises = this._decorators.map(function (decorator) {
                decorator.call(BEM.blocks['i-ajax'],
                    request.method,
                    request.args(),
                    requestOptions
                );
            }.bind(this));
            return Vow.all(promises);
        },
        /**
         * Check HTTP status
         * @param {Number} status
         * @return {Boolean}
         * @private
         */
        _checkStatus: function (status) {
            return (status >= 200 && status < 300);
        },

        /**
         * Get request method
         */
        _getRequestMethod: function (length) {
            return length < 800 ? 'get' : 'post';
        },
        /**
         * Send debounced queue
         * @private
         */
        _sendQueueDebounce: function () {
            this._sendQueueDebounce = jQuery.debounce(function () {
                this._sendQueue();
            }, 50);
            this._sendQueueDebounce();
        },

        /**
         * Handle combined request
         * @param {Array} promises
         * @param xhr
         * @returns {*}
         * @private
         */
        _onQueueRespond: function (promises, xhr) {
            var data,
                _this = this;

            if (this._checkStatus(xhr.status)) {
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    return this._rejectPromises(promises, 'Combined request failed — parse error');
                }
                return data.response.forEach(function (res, ind) {
                    if (_this._checkStatus(res.status)) {
                        promises[ind].fulfill(res.data);
                    } else {
                        promises[ind].reject(new HTTPError(
                            res.status,
                            res.error
                        ));
                    }
                });
            } else {
                this._rejectPromises(promises, 'Combined request failed — error status: ' + xhr.status);
            }
        },

        /**
         * Send requests queue
         */
        _sendQueue: function () {
            var req,
                decoratorsPromises = [],
                reqs = [],
                requestOptions = new RequestOptions(),
                data = {
                    combine: true,
                    ts: Date.now(),
                    args: ''
                };

            while (this._requestQueue.length) {
                req = this._requestQueue.pop();
                reqs.push(req);
                decoratorsPromises.push(
                    this._executeDecorators(req, requestOptions)
                );
            }

            Vow.all(decoratorsPromises).then(function () {
                var promises = [],
                    args = [];

                reqs.forEach(function (req) {
                    req.prepareArgs();
                    args.push(req.ajaxParams);
                    promises.push(req.promise);
                });

                data.args = JSON.stringify(args);
                jQuery.extend(true, data, requestOptions.data);
                jQuery.ajax({
                    url: '/' + AJAX_KEYWORD + '/',
                    type: this._getRequestMethod(data.args.length),
                    data: data,
                    complete: this._onQueueRespond.bind(this, promises),
                    headers: requestOptions.headers
                });
            }.bind(this));

        },
        /**
         * Reject array of promises
         * @param {Array} arr
         * @param {String} [message]
         * @private
         */
        _rejectPromises: function (arr, message) {
            arr.forEach(function (promise) {
                promise.reject(message);
            });
        },

        /**
         * Add request to queue of requests for combine
         * @param {Request} request
         * @private
         */
        _addRequestToQueue: function (request) {
            this._requestQueue.push(request);
            if (this._requestDebounce) {
                this._sendQueueDebounce();
            } else {
                this._sendQueue();
            }
        },

        /**
         * Remote call server realisation of block
         * @param methodName
         * @param args
         * @returns {*}
         * @private
         */
        _remoteCall: function (methodName, args) {
            var promise = Vow.promise().timeout(this._TIMEOUT),
                blockName = this.getName(),
                ajaxParams = {
                    url: '/' + AJAX_KEYWORD + '/' + blockName + '/' + methodName + '/',
                    data: {
                        ts: Date.now(),
                        args: args
                    }
                };

            this._addRequestToQueue(new Request(methodName, ajaxParams, promise));
            return promise;
        },

        /**
         * Remote call for method
         * @param {String} method name
         * @param {Arguments|Array} args for method
         * @returns {Promise}
         */
        invoke: function (method, args) {
            return this._remoteCall(method, args);
        }
    });
}());
