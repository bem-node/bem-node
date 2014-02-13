/**
 * Request rest api
 */
(function () {
    var request = require('request'), //@see https://github.com/mikeal/request/
        url = require('url'),
        dns = require('dns'),
        apiResolveCache = {},
        querystring = require('querystring'),
        zlib = require('zlib');

    require('http').globalAgent.maxSockets = 20;

    BEM.decl('i-api-request', null, {

        /**
         * @abstruct
         */
        _apiHost: undefined,

        /**
         * Default api timeout time in ms
         */
        TIMEOUT: 5000,

        /**
         * Define request headers
         */
        _getRequestHeaders: function (hostname) {
            return {
                'Accept': 'application/json',
                'Content-type': 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'host': hostname, //bug with Host when capitalized in https://github.com/mikeal/request/
                'Connection': 'keep-alve'
            };
        },

        /**
         * Resolve ip address
         * @param {String} host
         * @return {Vow.promise}
         */
        _dnsResolve: function (parsedUrl) {
            var promises = ['resolve6', 'resolve4'].map(function (method) {
                var promise = Vow.promise();
                dns[method](parsedUrl.hostname, BEM.blocks['i-state'].bind(function (err, ips) {
                    if (err) {
                        return promise.reject(err);
                    }

                    var ip = ips[0],
                        testUrl = url.format({
                            protocol: parsedUrl.protocol,
                            hostname: ip,
                            port: parsedUrl.port
                        });

                    request(testUrl, function (err) {
                        if (err) {
                            return promise.reject(err);
                        }
                        promise.fulfill(ip);
                    });

                }));
                return promise;
            });

            return Vow.any(promises);
        },

        /**
         * Cachable resolve hostname in DNS.
         * Use cached ip if possible.
         * Maintain cache.
         * @param {Object} parsedUrl
         * @returns {Vow}
         */
        _resolveHostname: function (parsedUrl) {
            var host = parsedUrl.hostname;
            if (apiResolveCache[host]) {
                return Vow.fulfill(apiResolveCache[host]);
            }

            return this._dnsResolve(parsedUrl).then(function (ip) {
                apiResolveCache[host] = ip;
                return apiResolveCache[host];
            });
        },

        /**
         * Security check for resource
         *
         * @param {String} resource
         * @return {Boolean}
         */
        _checkResource: function (resource) {
            return resource.indexOf('?') === -1;
        },

        /**
         *  Http request rest api
         *
         *  @param {String} method Http method
         *  @param {String} resource resource or full url.
         *  if resource is used url is build as concatenation
         *  of this._apiHost and resource
         *  @param {Object} data
         *  @param {Object} [data.params] Get params
         *  @param {Object} [data.output=object] Output format
         *  @return {Vow.Promise}
         */
        _request: function (method, resource, data) {
            var requestUrl,
                parsedUrl;

            if (resource.indexOf('http') !== 0) {
                if (!this._checkResource(resource)) {
                    return Vow.reject(new this._HttpError(400));
                }
                if (!this._apiHost) {
                    return Vow.reject(new Error('_apiHost is not specified; Define ._apiHost on your level first'));
                }
                requestUrl = this._apiHost.replace(/\/+$/, '') + '/' + resource;
            } else {
                if (!this._checkResource(resource.replace(/https?\/\//, ''))) {
                    return Vow.reject(new this._HttpError(400));
                }
                requestUrl = resource;
            }
            parsedUrl = url.parse(requestUrl);

            return this._resolveHostname(parsedUrl).then(function (hostIp) {
                return this._requestApi(method, parsedUrl, hostIp, data);
            }.bind(this));
        },

        /**
         * Decode gziped body
         * @param {Object} res Response
         * @param {String|Buffer} body
         * @returns {Vow.promise}
         */
        _decodeBody: function (res, body) {
            var promise = Vow.promise();

            if (body && res.headers['content-encoding'] === 'gzip') {
                zlib.gunzip(body, function (err, decodedBody) {
                    if (err) {
                        promise.reject(err);
                    } else {
                        promise.fulfill(decodedBody.toString());
                    }
                });
            } else if (body) {
                promise.fulfill(body.toString());
            } else {
                promise.fulfill('');
            }
            return promise;
        },

        /**
         * Build request url from url, data to query, and host's ip address
         * @param {Object} parsedUrl Standart nodejs's object that represents url.
         * @param {Object} [query] data to send in url.
         * @param {String} [hostIp] Ip address of host, to send request to.
         * @returns {String}
         */
        _getUri: function (parsedUrl, query, hostIp) {
            var stringQuery = query && querystring.stringify(query),
                stringifiedUrl;
            parsedUrl = jQuery.extend({}, parsedUrl);
            parsedUrl.hostname = hostIp || parsedUrl.hostname;
            parsedUrl.host = parsedUrl.href = undefined;
            stringifiedUrl = url.format(parsedUrl);
            return stringifiedUrl + (stringQuery ? ((stringifiedUrl.indexOf('?') !== -1 ? '&' : '?') + stringQuery) : '');
        },

        /**
         * Build object with http request options
         * @param {String} method HTTP protocol method.
         * @param {Object} parsedUrl Standart nodejs's object that represents url.
         * @param {String} hostIp Ip address of host, to send request to.
         * @param {Object} data Data to send in url or in body of request
         * @returns {Object}
         */
        _buildRequestOptions: function (method, parsedUrl, hostIp, data) {
            return {
                uri: this._getUri(parsedUrl, data && data.params, hostIp),
                method: method,
                encoding: null,
                forever: true,
                headers: this._getRequestHeaders(parsedUrl.hostname),
                timeout: this.TIMEOUT
            };
        },

        /**
         * Makes request
         * @param requestOptions
         * @returns {Vow.promise}
         */
        _makeRequest: function (requestOptions) {
            var promise = Vow.promise();
            request(requestOptions, function (err, res, encodedBody) {
                promise.fulfill({err: err, res: res, encodedBody: encodedBody});
            });
            return promise;
        },

        /**
         * Request rest api with predefined api params
         * @param {String} method HTTP protocol method.
         * @param {Object} parsedUrl Standart nodejs's object that represents url.
         * @param {String} hostIp Ip address of host, to send request to.
         * @param {Object} data Data to send in url or in body of request
         * @returns {Vow}
         */
        _requestApi: function (method, parsedUrl, hostIp, data) {
            var _this = this,
                requestOptions = this._buildRequestOptions(method, parsedUrl, hostIp, data),
                originalUrl = this._getUri(parsedUrl, data && data.params);

            if (data && data.body) {
                requestOptions.body = this._normalizeBody(data.body);
            }

            return this._makeRequest(requestOptions).then(function (info) {
                return _this._checkResponse(info.err, info.res, {
                    method: method,
                    encodedBody: info.encodedBody,
                    originalUrl: originalUrl
                })
                    .then(function () {
                        return _this._decodeBody(info.res, info.encodedBody);
                    });
            })
                .then(function (body) {
                    return _this._handleSuccessResponse(body, data && data.requestSource === 'ajax' ? true : false);
                })
                .fail(function (err) {
                    if (err instanceof _this._HttpError) {
                        console.error(originalUrl, err.status, err.message);
                    }
                    return Vow.reject(err);
                });
        },

        /**
         *
         * @param err
         * @param res
         * @param options
         * @returns {Vow.promise}
         * @private
         */
        _checkResponse: function (err, res, options) {
            if (err) {
                if (err.code === 'ETIMEDOUT') {
                    return Vow.reject(new this._HttpError(500, ['ETIMEDOUT', options.method, options.originalUrl].join(' ')));
                }
                return Vow.reject(err);
            }
            if (res.statusCode >= 300) {
                return Vow.reject(new this._HttpError(
                    res.statusCode
                ));
            }
            return Vow.fulfill();
        },

        /**
         * Handles success response
         * @param body of response
         * @param isAjax
         * @returns {Vow.promise}
         */
        _handleSuccessResponse: function (body, isAjax) {
            var promise = Vow.promise();

            if (isAjax) {
                promise.fulfill(body);
            } else {
                this._parse(promise, body);
            }

            return promise;
        }
    });
}());
