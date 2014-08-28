var request = require('request'), //@see https://github.com/mikeal/request/
    url = require('url'),
    dns = require('dns'),
    zlib = require('zlib'),
    net = require('net'),
    apiResolveCache = {},
    HttpError =  BEM.blocks['i-errors'].HttpError;

/**
 * Checking TCP cottent to socket
 *
 * @param {Number} port
 * @param {String} ip
 *
 * @return {Vow.promise}
 * @fulfill if connected
 * @reject if not connected
 */
function testConnect(port, ip) {
    var client = net.connect({
            port: port,
            ip: ip
        }),
        promise = Vow.promise().timeout(100);

    client
        .on('error', function (e) {
            this.destroy();
            promise.reject(e);
        })
        .on('connect', function () {
            this.destroy();
            promise.fulfill();
        });

    return promise;
}

/**
 * @param {Object} options
 * @param {String} options.hostname
 * @param {String} options.protocol
 * @param {String} options.port
 *
 * @return {Vow.promise}
 */
function dnsResolve(options) {
    var promises = ['resolve6'].map(function (method) {
        var promise = Vow.promise();
        dns[method](options.hostname, BEM.blocks['i-state'].bind(function (err, ips) {
            if (err) {
                return promise.reject(err);
            }

            var ip = ips[0];

            testConnect(options.port, ip).then(
                function () {
                    promise.fulfill(ip);
                },
                promise.reject.bind(promise)
            );

        }));
        return promise;
    });

    return Vow.any(promises);
}


/**
 * Making request to API
 * @params {Object} options acording to https://github.com/mikeal/request#requestoptions-callback
 *
 * @return {Vow.promise}
 * @fulfill {Object} response
 * @fulfill {Number} response.statusCode
 * @fulfill {Object} response.headers
 * @fulfill {Buffer} response.body
 */
function requestApi(options) {
    var promise = Vow.promise();

    request(options, function (err, res, responseBuffer) {
        if (err) {
            if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
                return promise.reject(new HttpError(504));
            }
            return promise.reject(err);
        }
        decodeResponse(res, responseBuffer).then(
            function (response) {
                promise.fulfill({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: response
                });
            },
            promise.reject.bind(promise)
        );
    });
    return promise;
}

/**
 * Cachable resolve hostname in DNS.
 * Use cached ip if possible.
 * Maintain cache.
 *
 * @param {Object} options
 * @param {String} options.hostname
 * @param {String} options.protocol
 * @param {String} options.port
 *
 * @returns {Vow.promise}
 */
function resolveHostName(options) {
    var host = options.hostname;

    if (net.isIP(host)) {
        return Vow.fulfill(host);
    }

    if (apiResolveCache[host]) {
        return Vow.fulfill(apiResolveCache[host]);
    }

    return dnsResolve(options).then(function (ip) {
        apiResolveCache[host] = ip;
        return apiResolveCache[host];
    });
}

/**
 * Resoving hostname and replacing hostname to ip
 *
 * @param {Object} options
 * @return {Vow.promise} promise
 * @fulfill {Object} options
 */
function resolveHostNameOptions(options) {
    var parsedUrl = url.parse(options.url),
        requestOptions = jQuery.extend(null, options);

    return resolveHostName(parsedUrl).then(function (ip) {
        requestOptions.url = options.url.replace(parsedUrl.hostname, ip);
        requestOptions.headers = jQuery.extend(null, options.headers);
        requestOptions.headers.host = parsedUrl.hostname;
        return requestOptions;
    });
}

/**
 * Decode response
 *
 * @param {net.Stream} res
 * @param {Buffer} response
 *
 * @return {Vow.promise} promise
 * @fulfill {Buffer}
 */
function decodeResponse(res, response) {
    if (!response) {
        return Vow.fulfill('');
    }

    var promise = Vow.promise();

    if (res.headers['content-type'] === 'gzip') {
        zlib.gunzip(response, function (err, decoded) {
            if (err) {
                promise.reject(err);
            } else {
                promise.fulfill(decoded);
            }
        });
    } else {
        promise.fulfill(response);
    }
    return promise;

}


BEM.decl('i-http', null, ['get', 'post', 'delete', 'put'].reduce(function (o, method) {
    o[method] = function (resource, data) {
        return this._request(method, resource, data);
    };
    return o;
}, {}));

BEM.decl('i-http', null, {

    TIMEOUT: 5000,

    /**
     * Getting options for "request" module
     *
     * @param {Object} options
     * @param {String} url
     * @param {Object|String} [data] GET params or POST body
     * @param {String} method ('get', 'post', 'delete', 'put')
     *
     * @return {Vow.promise} result
     * @fulfill {Object} requestOptions acording to https://github.com/mikeal/request#requestoptions-callback
     */
    _getRequestOptions: function (options) {
        var parsedUrl = url.parse(options.url),
            data = options.data,
            requestOptions = {
                method: options.method,
                timeout: this.TIMEOUT,
                encoding: null,
                headers: this._getRequestHeaders(parsedUrl)
            };

        if (data) {
            if (options.method === 'get') {
                requestOptions.qs = data;
            } else {
                requestOptions.body = typeof data === 'object' ? JSON.stringify(data) : String(data);
            }
        }

        return resolveHostName(parsedUrl).then(function (ip) {
            requestOptions.uri = options.url.replace(parsedUrl.hostname, ip);
            return requestOptions;
        });

    },

    /**
     * Define request headers
     *
     * @param {Object} options
     * @param {String} options.hostname
     */
    _getRequestHeaders: function (options) {
        return {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'Accept-Encoding': 'gzip',
            'host': options.hostname, //bug with Host when capitalized in https://github.com/mikeal/request/
            'Connection': 'keep-alve'
        };
    },

    /**
     * Making request to API
     * @params {Object} options acording to https://github.com/mikeal/request#requestoptions-callback
     *
     * @return {Vow.promise}
     * @fulfill {Object} response
     * @fulfill {Number} response.statusCode
     * @fulfill {Object} response.headers
     * @fulfill {Buffer} response.body
     */
    request: function (options) {
        return resolveHostNameOptions(options).then(function (options) {
            return requestApi(options);
        });
    },

    /**
     * Making request to API
     * @params {Object} options acording to https://github.com/mikeal/request#requestoptions-callback
     *
     * @return {Vow.promise}
     * @fulfill {net.Stream} response
     */
    requestStream: function (options) {
        return resolveHostNameOptions(options).then(function (options) {
            return request(options);
        });
    },

    /**
     *  Http request rest api
     *
     *  @param {String} method Http method
     *  @param {String} resource resource or full url.
     *  if resource is used url is build as concatenation
     *  of this._apiHost and resource
     *  @param {Object} data GET params of POST body
     *
     *  @return {Vow.Promise}
     *  @reject {HttpError}
     *  @fulfill {Object} response
     *  @fulfill {Buffer} response.body
     *  @fulfill {Object} response.headers
     *  @fulfill {Number} response.statusCode
     */
    _request: function (method, resource, data) {
        var requestUrl;

        if (!this._apiHost) {
            return Vow.reject(new Error('_apiHost is not specified; Define ._apiHost on your level first'));
        }

        requestUrl = this._apiHost.replace(/\/+$/, '');

        if (resource) {
            requestUrl += '/' + resource;
        }

        return this._getRequestOptions({
            method: method,
            url: requestUrl,
            data: data
        }).then(function (options) {
            return requestApi(options);
        });

    }

});
