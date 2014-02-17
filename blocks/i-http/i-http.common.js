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
    var HttpError = function(status, message, responseBody) {
        this.status = status;
        this.message = message;
        if (responseBody) {
            this.message += ' ' + String(responseBody).replace(/\n/g, '\\n');
        }
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    };
    HttpError.prototype = Object.create(Error.prototype);
    HttpError.prototype.message = 'Http Error';
    HttpError.prototype.name = 'E_HTTP_ERROR';

    BEM.decl('i-http', {}, {
        _HttpError: HttpError,
        isHttpError: function (err) {
            return err instanceof HttpError;
        }
    });
}());

