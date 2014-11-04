/**
 * Static server with enb make on demand
 */
if (!BEM.blocks['i-command'].get('no-static-proxy')) {
    var urlParse = require('url').parse,
        enbServerMiddleware = require('enb/lib/server/server-middleware'),
        middleware = enbServerMiddleware.createMiddleware({
            cdir: process.cwd(),
            noLog: true
        }),
        HttpError = BEM.blocks['i-errors'].HttpError;

    BEM.blocks['i-router'].define('GET', /\.\w+$/i, 'i-enb');

    BEM.decl('i-enb', null, {

        init: function () {
            var iRouter = BEM.blocks['i-router'],
                path = iRouter.getPath(),
                req = iRouter.getReq();

            // added "path" field into request to emulate "express" behaviour (enb < 0.12)
            req.path = req.url;
            // added "_parsedUrl" field into request to emulate "connect" behaivor (enb >= 0.12)
            req._parsedUrl = urlParse(path);

            return this._checkAllowedFiles(path).then(function () {
                var promise = Vow.promise();

                middleware(req, iRouter.getRes(), function () {
                    // emulate express next() function
                    promise.reject(new HttpError(404));
                });

                return promise;
            });
        },

        /**
         * @param  {String} path
         * @return {Vow.promise}
         */
        _checkAllowedFiles: function (path) {
            if (path.match(/(priv|server)\.js$/)) {
                return Vow.reject(new HttpError(404));
            }
            return Vow.fulfill();
        }

    });
}
