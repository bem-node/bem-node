/*global env:true*/
/**
 * Creating page context
 *
 * @ex
 *   env('/foo?bar=baz', function () {
 *       BEM.blocks['i-router'].getParams() // {bar: 'baz'}
 *   });
 *
 * @param {String} [url]
 * @param {Function} fn that will execute in page context
 *
 * @return {Vow.promise}
 * @fulfill {Object} [meta]
 * @fulfill {String} meta.statusCode
 * @fulfill {String} meta.body
 */
var domain = require('domain'),
    http = require('http');

global.env = env = function (path, fn) {
    var pathPromise = Vow.promise();

    if (arguments.length === 1) {
        fn = path;
        path = null;
    }

    if (path) {
        http
            .get('http://127.0.0.1:3000' + path, function (res) {
                var key = res.headers['c-node-state-key'],
                    chunks = [];

                res.on('data', function (data) {
                    chunks.push(data);
                });
                res.on('end', function () {
                    pathPromise.fulfill({
                        stateKey: key,
                        statusCode: res.statusCode,
                        body: Buffer.concat(chunks).toString('utf8')
                    });
                });
            })
            .on('error', pathPromise.reject.bind(pathPromise));
    } else {
        pathPromise.fulfill();
    }

    return pathPromise.then(function (meta) {
        var d = domain.create(),
            promise = Vow.promise();

        d.run(function () {
            if (meta && meta.stateKey) {
                process.domain.state = env.states[meta.stateKey];
                delete meta.stateKey;
            }

            var result = fn(meta);
            if (Vow.isPromise(result)) {
                result.then(
                    promise.fulfill.bind(promise),
                    promise.reject.bind(promise)
                ).done();
            } else {
                promise.fulfill(result);
            }
        });

        return promise;
    });

};
global.env.states = {};
