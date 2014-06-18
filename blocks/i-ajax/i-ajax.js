/**
 * Block for create cross client-server block (with fabric method 'create')
 */
(function () {
    var AJAX_KEYWORD = BEM.blocks['i-ajax'].AJAX_KEYWORD;

    BEM.decl('i-ajax', {}, {

        _TIMEOUT: 1000,

        _requestDebounce: false,

        _requestQueue: [],

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
         */
        _sendQueueDebounce: jQuery.debounce(function () {
            this._sendQueue();
        }, 50),
        /**
         * Send queue
         */
        _sendQueue: function () {
            var req,
                _this = this,
                promises = [],
                args = [],
                HTTPError = BEM.blocks['i-http']._HttpError,
                data = {
                    combine: true,
                    ts: Date.now(),
                    args: ''
                };

            while (this._requestQueue.length) {
                req = this._requestQueue.pop();
                args.push(req.data);
                promises.push(req.promise);
            }

            data.args = JSON.stringify(args);
            jQuery.ajax({
                url: '/' + AJAX_KEYWORD + '/',
                type: this._getRequestMethod(data.args.length),
                data: data,
                complete: function (xhr) {
                    if (_this._checkStatus(xhr.status)) {
                        try {
                            data = JSON.parse(xhr.responseText);
                        } catch (e) {
                            _this._rejectPromises(promises, 'Combined request failed');
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
                        _this._rejectPromises(promises, 'Combined request failed');
                    }
                }
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
         * @param data
         * @param promise
         * @private
         */
        _addRequestToQueue: function (data, promise) {
            this._requestQueue.push({
                data: data,
                promise: promise
            });
            this._sendQueueDebounce();
        },

        /**
         * Remote call server realisation of block
         * @param methodName
         * @param args
         * @param [optionalParams]
         * @returns {*}
         * @private
         */
        _remoteCall: function (methodName, args, optionalParams) {
            var promise = Vow.promise().timeout(this._TIMEOUT),
                blockName = this.getName(),
                _this = this,
                HttpError = BEM.blocks['i-http']._HttpError,
                requestData = {
                    url: '/' + AJAX_KEYWORD + '/' + blockName + '/' + methodName + '/',
                    data: jQuery.extend({
                        ts: Date.now(),
                        args: args
                    }, optionalParams || {})
                };

            if (this._requestDebounce) {
                this._addRequestToQueue(requestData, promise);
            } else {
                jQuery.ajax(jQuery.extend(requestData, {
                    type: this._getRequestMethod(JSON.stringify(args).length),
                    complete: function (xhr) {
                        var data;
                        if (_this._checkStatus(xhr.status)) {
                            try {
                                data = JSON.parse(xhr.responseText);
                            } catch (e) {
                                return promise.reject(e);
                            }
                            return promise.fulfill(data.data);
                        }

                        return promise.reject(new HttpError(
                            xhr.status,
                            'bad status'
                        ));
                    }
                }));
            }
            return promise;
        },

        /**
         * Prepare
         * @param args
         * @returns {window.JSON.stringify|*}
         * @private
         */
        _prepareArgs: function (args) {
            return JSON.stringify(Array.prototype.slice.call(args));
        },

        /**
         * Fabric method for create AJAX blocks
         * @param {Array} ajaxMethods
         * @param {Object} [optionalParams]
         * @returns {Object}
         */
        create: function (ajaxMethods, optionalParams) {
            var base = {};
            ajaxMethods.reduce(function (base, method) {
                base[method] = function () {
                    return this._remoteCall(method, this._prepareArgs(arguments), optionalParams);
                };
                return base;
            }, base);

            return jQuery.extend(base, {
                _allowAjax: ajaxMethods
            });
        }
    });
}());
