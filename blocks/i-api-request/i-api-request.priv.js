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

        _apiHostConfigKey: 'api',

        /**
         * @abstruct
         */
        _apiHost: undefined,

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

        // TODO setConfig
        _config: {},

        /**
         * Resolve ip and set defaults for requests
         */
        _resolveApiParams: function (parse) {
            var promise = Vow.promise(),
                _this = this,
                host = parse.hostname,
                apiHost;

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
                            timeout: _this._config.timeout || 5000,
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
            console.log(path);
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
            return uri + (query ? ((uri.indexOf('?') !== -1 ? '&' : '?') + querystring.stringify(query)) : '');
        },

        /**
         * Request rest api with predefined api params
         */
        _requestApi: function (apiParams, method, resource, data) {
            var promise = Vow.promise(),
                _this = this,
                query = data && data.params, 
                // TODO _resolveApiParams()
                requestUri = this._getUri(resource, query),
                start = Date.now(),
                requestOptions = {
                    uri: requestUri,
                    method: method,
                    encoding: null,
                    forever: true,
                    headers: apiParams.headers,
                    timeout: apiParams.timeout
                };

            request(requestOptions, function (err, res, encodedBody) {
                if (err) {
                    if (err.code === 'ETIMEDOUT') {
                        console.error(['Timeout', this._timeout, requestUri].join(' '));
                        promise.reject(_this._HttpError(500, 'ETIMEDOUT'));
                    } else {
                        promise.reject(err);
                    }
                } else {
                    _this._decodeBody(res, encodedBody, function (err, body) {
                        if (err) {
                            promise.reject(err);
                        } else {
                            if (res.statusCode !== 200) {
                                promise.reject(new _this._HttpError(
                                    res.statusCode,
                                    body
                                ));
                            } else if (data && data.output === 'string') {
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
