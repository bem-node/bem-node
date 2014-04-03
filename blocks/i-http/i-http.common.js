/**
 * HTTP stuff
 */
(function () {
    /**
     * Http error constructor
     *
     * @param {Number} status
     * @param {String} message
     * @param {String} responseBody
     */
    var HttpError = function (status, message, responseBody) {
        this.status = status;
        this.message = message;
        this.responseBody = responseBody;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        } else {
            // fallback for firefox
            var e = new Error();
            this.fileName = e.fileName;
            this.lineNumber = e.lineNumber;
            if (e.stack) {
                this.stack = e.stack.split('\n').slice(1).join('\n');
            }
        }
    };
    HttpError.prototype = Object.create(Error.prototype);
    HttpError.prototype.name = 'HttpError';

    BEM.decl('i-http', {}, {
        _HttpError: HttpError,
        HttpError: HttpError,
        isHttpError: function (err) {
            return err instanceof HttpError;
        }
    });
}());
