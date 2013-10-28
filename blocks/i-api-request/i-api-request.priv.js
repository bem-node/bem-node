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
         * @see http://nodejs.org/api/dns.html#dns_dns_resolve_domain_rrtype_callback
         */
        _resolveMethods: ['resolve4', 'resolve6'],

        /**
         * Resolve ip address
         * @param {String} host
         * @return {Vow.promise}
         */
        _dnsResolve: function (host) {
            return Vow.any(this._resolveMethods.map(function (method) {
                var promise = Vow.promise();
                dns[method](host, BEM.blocks['i-state'].bind(function (err, ipArr) {
                    if (err) {
                        return promise.reject(err);
                    }
                    promise.fulfill(ipArr[0]);
                }));
                return promise;
            }));
        },

        /**
         * Resolve ip and set defaults for requests
         */
        _resolveApiParams: function (parse) {
            var _this = this,
                host = parse.hostname;

            if (apiResolveCache[host]) {
                return Vow.fulfill(apiResolveCache[host]);
            }

            return this._dnsResolve(host).then(function (ip) {
                var apiParams = {
                    headers: _this._getRequestHeaders(host),
                    ip: ip,
                    protocol: parse.protocol,
                    port: parse.port || 80
                };
                apiResolveCache[host] = apiParams;
                return apiParams;
            });
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

        _getUri: function (resource, query, apiParams) {
            var stringQuery = query && querystring.stringify(query),
                path = apiParams ?
                url.format({
                    protocol: apiParams.protocol,
                    hostname: apiParams.ip,
                    port: apiParams.port,
                    pathname: resource.replace(/https?\:\/\/[^\/]+/, '')
                }) :
                resource;

            return path + (stringQuery ? ((path.indexOf('?') !== -1 ? '&' : '?') + stringQuery) : '');
        },

        /**
         * Request rest api with predefined api params
         */
        _requestApi: function (apiParams, method, resource, data) {
            var promise = Vow.promise(),
                _this = this,
                query = data && data.params,
                requestUri = this._getUri(resource, query, apiParams),
                requestOptions = {
                    uri: requestUri,
                    method: method,
                    encoding: null,
                    forever: true,
                    headers: apiParams.headers,
                    timeout: this.TIMEOUT
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
                            if (res.statusCode !== 200) {
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
