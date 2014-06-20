/**
 * Block for create cross client-server block (with fabric method 'create')
 */
(function () {
    var AJAX_KEYWORD = BEM.blocks['i-ajax'].AJAX_KEYWORD;

    BEM.decl('i-ajax', {}, {

        /**
         * This value MUST be lower then browser network timeout
         * Network timeouts for browsers:
         * Firefox: ~115s
         * IE: ~60s
         * Chrome: ~300s
         * Opera: ~120s
         */
        _TIMEOUT: 25000,

        _requestDebounce: false,

        _requestQueue: [],

        /**
         * Fabric method for create AJAX blocks
         * @param {Array} ajaxMethods
         * @returns {Object}
         */
        create: function (ajaxMethods) {
            var base = {};

            ajaxMethods.reduce(function (base, method) {
                base[method] = function () {
                    return this._addRequestToQueue(this.getName(), method, this._prepareArgs(arguments));
                };
                return base;
            }, base);

            return jQuery.extend(base, {
                _allowAjax: ajaxMethods
            });
        },

        /**
         * Prepares AJAX options for request
         * @param {Object} [request] Object with params for request (blockName, methodName, args, promise)
         * @returns {*}
         */
        prepareAjaxOptions: function (request) {
            var options = {
                data: {
                    args: ''
                }
            };

            if (this._requestDebounce) {
                options.data.combine = true;
                options.url = '/' + AJAX_KEYWORD + '/';
                options.data.args = JSON.stringify(this._requestQueue.map(function (req) {
                    return {
                        url: '/' + AJAX_KEYWORD + '/' + req.blockName + '/' + req.methodName + '/',
                        args: req.args
                    };
                }));
                options.type = this._getRequestMethod(options.data.args.length);
            } else {
                options.url = '/' + AJAX_KEYWORD + '/' + request.blockName + '/' + request.methodName + '/';
                options.data.args = request.args;
                options.type = this._getRequestMethod(JSON.stringify(options.data.args).length);
            }

            return Vow.fulfill(options);
        },

        /**
         * Parse resonse from server
         * @param {jqXHR} xhr
         * @returns {*}
         */
        parseResponse: function (xhr) {
            var data;

            if (this._checkStatus(xhr.status)) {
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    return Vow.reject({message: e});
                }
                return Vow.fulfill(data.response);
            } else {
                return Vow.reject({status: xhr.status, message: xhr.statusText});
            }
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
         * @param {Number} length
         */
        _getRequestMethod: function (length) {
            return length < 800 ? 'get' : 'post';
        },

        /**
         * Send debounced queue
         */
        _sendQueueDebounce: jQuery.debounce(function () {
            this._sendQueue();
        }, 50),

        /**
         * Send queue
         * @param {Object} [request] Object with params for request (blockName, methodName, args, promise)
         */
        _sendQueue: function (request) {
            var _this = this,
                promises = [],
                HTTPError = BEM.blocks['i-http']._HttpError;

            this.prepareAjaxOptions(request).then(function (options) {
                if (request && request.promise) {
                    promises = [request.promise];
                } else {
                    while (_this._requestQueue.length) {
                        promises.push(_this._requestQueue.shift().promise);
                    }
                }

                jQuery.ajax(jQuery.extend(options, {
                    cache: false,
                    complete: function (xhr) {
                        _this.parseResponse(xhr).always(function (p) {
                            var data = p.isResolved() && p.valueOf();

                            if (p.isRejected()) {
                                _this._rejectPromises(promises, data.message);
                            } else {
                                data.forEach(function (res, ind) {
                                    if (res.status && _this._checkStatus(res.status)) {
                                        promises[ind].fulfill(res.data);
                                    } else {
                                        promises[ind].reject(new HTTPError(
                                            res.status,
                                            res.error
                                        ));
                                    }
                                });
                            }
                        });
                    }
                }));
            });
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
            throw new Error(message);
        },

        /**
         * Add request to queue of requests for combine
         * @param {String} blockName
         * @param {String} methodName
         * @param {String} args
         * @returns {*}
         * @private
         */
        _addRequestToQueue: function (blockName, methodName, args) {
            var promise = Vow.promise().timeout(this._TIMEOUT),
                req = {
                    blockName: blockName,
                    methodName: methodName,
                    args: args,
                    promise: promise
                };

            if (this._requestDebounce) {
                this._requestQueue.push(req);
                this._sendQueueDebounce();
            } else {
                this._sendQueue(req);
            }

            return promise;
        },

        /**
         * Prepare
         * @param {Array} args
         * @returns {String}
         * @private
         */
        _prepareArgs: function (args) {
            return JSON.stringify(Array.prototype.slice.call(args));
        }
    });
}());
