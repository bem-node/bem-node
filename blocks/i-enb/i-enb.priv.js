/**
 * Static server with enb make on demand
 */
if (!BEM.blocks['i-command'].get('no-static-proxy')) {
    var urlParse = require('url').parse;
    var mime = require('mime');
    var cdir = process.cwd();
    var TargetNotFoundError = require('enb/lib/errors/target-not-found-error');
    var builder = require('enb/lib/server/middleware/enb')({
        root: cdir,
        log: false
    });
    var fs = require('fs');
    var HttpError = BEM.blocks['i-errors'].HttpError;

    BEM.blocks['i-router'].define('GET', /\.\w+$/i, 'i-enb');

    BEM.decl('i-enb', null, {

        /**
         * @param  {String} path
         * @param  {String} mimeType
         * @return {Promise}
         */
        _checkAllowedFiles: function (path, mimeType) {
            if (mimeType === 'application/javascript') {
                if (path.match(/(priv|server)\.js$/)) {
                    return Vow.reject(new HttpError(404));
                }
            }
            return Vow.fulfill();
        },

        /**
         * @param  {String} path
         * @return {Promise.<{String} resolvedPath>}
         */
        _getFilename: function (path) {
            var p = Vow.promise();
            fs.realpath(cdir + path, function (err, resolvedPath) {
                if (err) {
                    p.reject(new HttpError(404));
                } else {
                    p.fulfill(resolvedPath);
                }
            });
            return p;
        },

        init: function () {
            var path = BEM.blocks['i-router'].getPath(),
                mimeType = mime.lookup(path),
                req = BEM.blocks['i-router'].getReq(),
                res = BEM.blocks['i-router'].getRes(),
                mimeCharset = mimeType === 'application/javascript' ?
                    'UTF-8' :
                    mime.charsets.lookup(mimeType, null),
                _this = this;

            res.setHeader('Content-Type', mimeType + (mimeCharset ? '; charset=' + mimeCharset : ''));

            // added "_parsedUrl" field into request to emulate "connect" behaivor (enb >= 0.13.4)
            req._parsedUrl = urlParse(path);

            return this._checkAllowedFiles(path, mimeType).then(function () {
                var promise = Vow.promise();

                builder(req, res, function (err) {
                    if (err && !(err instanceof TargetNotFoundError)) {
                        console.log(err);
                    }

                    _this._getFilename(path).then(function (filename) {
                        promise.fulfill(filename);
                    });
                });
                return promise;
            }).then(function (filename) {
                fs.createReadStream(filename).pipe(res);
                return Vow.fulfill();
            });

        }
    });
}
