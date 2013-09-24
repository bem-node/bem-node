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
        _timeout: 5000,
        
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
         * Resolve ip and set defaults for requests
         */
        _resolveApiParams: function (parse) {
            var promise = Vow.promise(),
                _this = this,
                host = parse.hostname;

            if (apiResolveCache[host]) {
                promise.fulfill(apiResolveCache[host]);
            } else {
                dns.resolve(host, BEM.blocks['i-state'].bind(function (err, ipArr) {
                    var apiParams;
                    if (err) {
                        promise.reject(err);
                    } else {
                        apiParams = {
                            headers: _this._getRequestHeaders(host),
                            host: host,
                            timeout: _this._timeout,
                            uri: url.format({
                                protocol: parse.protocol,
                                hostname: ipArr[0],
                                port: parse.port || 80,
                                pathname: parse.path
                            })
                        };
                        apiResolveCache[host] = apiParams;
                        promise.fulfill(apiParams);
                    }
                }));
            }
            return promise;
        },

        /**
         *  Http request rest api
         *
         *  @param {String} method Http method
         *  @param {String} resource
         *  @param {Object} data
         *  @param {Object} [data.params] Get params
         *  @param {Object} [data.output=object] Output format
         *  @return {Vow.Promise}
         */
        _request: function (method, resource, data) {
            var path, parse;
            
            if (resource.indexOf('http') !== 0) {
                if (!this._apiHost) {
                    return Vow.reject(new Error('_apiHost is not specified; Define ._apiHost on your level first'));
                }
                path = this._apiHost + resource;
            } else {
                path = resource;
            }
            parse = url.parse(path);

            return this._resolveApiParams(parse).then(function (apiParams) {
                return this._requestApi(apiParams, method, path, data);
            }.bind(this));
        },

        /**
         * Decode gziped body
         */
        _decodeBody: function (res, body, callback) {
            if (body && res.headers['content-encoding'] === 'gzip') {
                zlib.gunzip(body, function (err, decodedBody) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, decodedBody.toString());
                    }
                });
            } else if (body) {
                callback(null, body.toString());
            } else {
                callback(null, '');
            }
        },

        _getUri: function (uri, query) {
            var stringQuery = query && querystring.stringify(query);
            return uri + (stringQuery ? ((uri.indexOf('?') !== -1 ? '&' : '?') + stringQuery) : '');
        },

        /**
         * Request rest api with predefined api params
         */
        _requestApi: function (apiParams, method, resource, data) {
            var promise = Vow.promise(),
                _this = this,
                query = data && data.params,
                requestUri = this._getUri(resource, query),
                requestOptions = {
                    uri: requestUri,
                    method: method,
                    encoding: null,
                    forever: true,
                    headers: apiParams.headers,
                    timeout: apiParams.timeout
                };

            if (data && data.body) {
                requestOptions.body = this._normalizeBody(data.body);
            }
            request(requestOptions, function (err, res, encodedBody) {
                if (err) {
                    if (err.code === 'ETIMEDOUT') {
                        console.error(['ETIMEDOUT', method, requestUri].join(' '));
                        promise.reject(new _this._HttpError(500, ['ETIMEDOUT', method, requestUri].join(' ')));
                    } else {
                        promise.reject(err);
                    }
                } else {
                    _this._decodeBody(res, encodedBody, function (err, body) {
                        if (err) {
                            promise.reject(err);
                        } else {
                            if (res.statusCode < 200 || res.statusCode > 299) {
                                console.error([res.statusCode, method, requestUri].join(' '));
                                promise.reject(new _this._HttpError(
                                    res.statusCode,
                                    [method, requestUri].join(' ')
                                ));
                            } else if (data && data.requestSource === 'ajax') {
                                promise.fulfill(body);
                            } else {
                                _this._parse(promise, body);
                            }
                        }
                    });
                }
            });

            return promise;
        }
    });
}());
