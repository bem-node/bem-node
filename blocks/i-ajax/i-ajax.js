/**
 * Block for create cross client-server block (with fabric method 'create')
 */
(function () {
    var AJAX_KEYWORD = BEM.blocks['i-ajax'].AJAX_KEYWORD,
        HTTPError = BEM.blocks['i-http'].HttpError;

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
                    this._rejectPromises(promises, 'Combined request failed');
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
                this._rejectPromises(promises, 'Combined request failed');
            }
        },
        /**
         * Send queue
         */
        _sendQueue: function () {
            var req,
                promises = [],
                args = [],
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
                complete: this._onQueueRespond.bind(this, promises)
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
         * Send and handle single request
         * @param {Object} requestData
         * @param {Promise} promise
         * @param {Object} args
         * @private
         */
        _sendSingleRequest: function (requestData, promise, args) {
            jQuery.ajax(jQuery.extend({}, requestData, {
                type: this._getRequestMethod(JSON.stringify(args).length),
                complete: function (xhr) {
                    var data;
                    if (this._checkStatus(xhr.status)) {
                        try {
                            data = JSON.parse(xhr.responseText);
                        } catch (e) {
                            return promise.reject(e);
                        }
                        return promise.fulfill(data.data);
                    }

                    return promise.reject(new HTTPError(
                        xhr.status,
                        'bad status'
                    ));
                }.bind(this)
            }));
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
                requestData = {
                    url: '/' + AJAX_KEYWORD + '/' + blockName + '/' + methodName + '/',
                    data: {
                        ts: Date.now(),
                        args: args
                    }
                };

            if (this._requestDebounce) {
                this._addRequestToQueue(requestData, promise);
            } else {
                this._sendSingleRequest(requestData, promise, args);
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
         * Remote call for method
         * @param {String} method name
         * @param {Arguments|Array} args for method
         * @returns {Promise}
         */
        invoke: function (method, args) {
            return this._remoteCall(method, this._prepareArgs(args));
        }
    });
}());
