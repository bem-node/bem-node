/**
 * Provides api to resolve ips by host name
 * and checks tcp connection for resolved ips
 */
(function () {
    var url = require('url'),
        net = require('net'),
        dns = require('dns');

    BEM.decl('i-dns-lookup', null, {

        /**
         * Dns lookup timeout, ms
         * @type {Number}
         */
        TIMEOUT: 50,

        /**
         * Dns lookup retries count
         * @type {Number}
         */
        RETRIES: 3,

        /**
         * Timeout to check resolved ip, ms
         * @type {Number}
         */
        TIMEOUT_TCP_CHECK: 500,

        /**
         * Resolve ip address
         *
         * @param {String|Object} hostname Host name or result of url.parse
         * @param {Object} [options]
         * @param {(4|6)} [options.family] If given, will resolve only required addresses
         * @param {Boolean} [options.checkConnection=false] If true, will also check is host accessible
         * @returns {Vow.promise}
         * @returns {Vow.promise.fulfill(<Array>)}
         */
        lookup: function (hostname, options) {
            var parsedUrl = typeof hostname === 'string' ? url.parse(hostname) : hostname,
                promise;

            hostname = parsedUrl.hostname;
            options = options || {};
            promise = options.family ? this._dnsResolveIpByFamily(hostname, options.family) : this._dnsResolveIp(hostname);
            if (options.checkConnection) {
                promise = promise.then(this._checkTcpConnection.bind(this, parsedUrl));
            }

            return promise;
        },

        /**
         * Resolves ip6 and ip4 addresses by given hostname
         * Will return array with leading ip6 addresses
         * Will return any addresses, if some family resolve fails
         *
         * @param {String} hostname
         * @returns {Vow.promise}
         * @returns {Vow.promise.fulfill(<Array>)}
         */
        _dnsResolveIp: function (hostname) {
            return Vow.allResolved([
                this._dnsResolveIpByFamily(hostname, 6),
                this._dnsResolveIpByFamily(hostname, 4)
            ])
            .spread(function (ip6, ip4) {
                if (ip6.isRejected() && ip4.isRejected()) {
                    return Vow.reject(new Error(ip6.valueOf().message + '\r\n' + ip4.valueOf().message));
                }

                return (ip6.isFulfilled() ? ip6.valueOf() : [])
                    .concat(ip4.isFulfilled() ? ip4.valueOf() : []);
            });
        },

        /**
         * Resolves ip addresses for hostname by given family
         *
         * @param {String} hostname
         * @param {(4|6} family
         * @returns {Vow.promise}
         * @returns {Vow.promise.fulfill(<Array>)}
         */
        _dnsResolveIpByFamily: function (hostname, family, retry) {
            var promise = Vow.promise();

            dns['resolve' + family](hostname, BEM.blocks['i-state'].bind(function (err, ips) {
                if (err) {
                    promise.reject(err);
                } else {
                    promise.fulfill(ips);
                }
            }));
            setTimeout(function () {
                if (!promise.isResolved()) {
                    promise.reject(new Error(dns.TIMEOUT));
                }
            }, this.TIMEOUT);

            retry = retry || 0;
            if (retry < this.RETRIES) {
                return promise.fail(this._dnsResolveIpByFamily.bind(this, hostname, family, retry + 1));
            }

            return promise.fail(function (err) {
                return Vow.reject(new Error('DNS resolve ip' + family + ' ' + err.message + ' for ' + hostname));
            });
        },

        /**
         * Checks tcp connection for list of ips
         * Use port (or port by protocol) from url to connect to ip
         *
         * @param {Object} parsedUrl Result of url.parse
         * @param {Number} parsedUrl.port
         * @param {String} parsedUrl.protocol
         * @param {Array} ips
         * @returns {Vow.promise}
         * @returns {Vow.promise.fulfill(<Array>)}
         */
        _checkTcpConnection: function (parsedUrl, ips) {
            var _this = this;

            return Vow.allResolved(ips.map(function (ip) {
                var promise = Vow.promise(),
                    host = ip,
                    port = parsedUrl.port || ({
                        'http:': 80,
                        'https:': 443
                    })[parsedUrl.protocol] || 80,
                    connect;

                connect = net.createConnection({
                    host: host,
                    port: port,
                    allowHalfOpen: true
                })
                .on('connect', function () {
                    promise.fulfill(ip);
                })
                .on('error', function (err) {
                    promise.reject(err);
                });
                setTimeout(function () {
                    if (!promise.isResolved()) {
                        promise.reject(new Error('TIMEOUT'));
                    }
                }, _this.TIMEOUT_TCP_CHECK);

                return promise.fail(function (err) {
                    return Vow.reject(new Error('TCP connect ' + err.message +
                        ' for ' + host + ':' + port + ' (' + parsedUrl.hostname + ')'));
                })
                .always(function (promise) {
                    connect.destroy();
                    return promise;
                });
            }))
            .then(function (all) {
                var ips = [];

                all.forEach(function (promise) {
                    if (promise.isFulfilled()) {
                        ips.push(promise.valueOf());
                    }
                });

                if (ips.length) {
                    return ips;
                }

                return Vow.reject(new Error(all.map(function (promise) {
                    return promise.valueOf().message;
                }).join('\r\n')));
            });
        }

    });
}());
