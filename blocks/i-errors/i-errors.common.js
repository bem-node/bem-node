/**
 * Error classes
 */
(function () {

    /**
     * Custom error
     * @class
     * @extends Error
     * @param {String} message
     */
    var CommonError  = function (message) {
        this.name = 'CommonError';
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CommonError);
        } else {
            this.stack = (new Error()).stack;
        }
    };

    CommonError.prototype = new Error();
    CommonError.prototype.constructor = CommonError;

    /**
     * Http Error
     * @class
     * @extends CommonError
     * @param {Number} status
     */
    var HttpError = function (status) {
        var message = HttpError.STATUS_CODES[String(status)] || 'Unknown';
        CommonError.call(this, message);
        this.status = Number(status);
        this.name = 'HttpError';
    };

    HttpError.prototype = new CommonError();
    HttpError.prototype.constructor = HttpError;

    /**
     * require('http').STATUS_CODES
     * @type {Object.<status, message>}
     */
    HttpError.STATUS_CODES = {
        '100': 'Continue',
        '101': 'Switching Protocols',
        '102': 'Processing',
        '200': 'OK',
        '201': 'Created',
        '202': 'Accepted',
        '203': 'Non-Authoritative Information',
        '204': 'No Content',
        '205': 'Reset Content',
        '206': 'Partial Content',
        '207': 'Multi-Status',
        '300': 'Multiple Choices',
        '301': 'Moved Permanently',
        '302': 'Moved Temporarily',
        '303': 'See Other',
        '304': 'Not Modified',
        '305': 'Use Proxy',
        '307': 'Temporary Redirect',
        '400': 'Bad Request',
        '401': 'Unauthorized',
        '402': 'Payment Required',
        '403': 'Forbidden',
        '404': 'Not Found',
        '405': 'Method Not Allowed',
        '406': 'Not Acceptable',
        '407': 'Proxy Authentication Required',
        '408': 'Request Time-out',
        '409': 'Conflict',
        '410': 'Gone',
        '411': 'Length Required',
        '412': 'Precondition Failed',
        '413': 'Request Entity Too Large',
        '414': 'Request-URI Too Large',
        '415': 'Unsupported Media Type',
        '416': 'Requested Range Not Satisfiable',
        '417': 'Expectation Failed',
        '418': 'I\'m a teapot',
        '422': 'Unprocessable Entity',
        '423': 'Locked',
        '424': 'Failed Dependency',
        '425': 'Unordered Collection',
        '426': 'Upgrade Required',
        '428': 'Precondition Required',
        '429': 'Too Many Requests',
        '431': 'Request Header Fields Too Large',
        '500': 'Internal Server Error',
        '501': 'Not Implemented',
        '502': 'Bad Gateway',
        '503': 'Service Unavailable',
        '504': 'Gateway Time-out',
        '505': 'HTTP Version Not Supported',
        '506': 'Variant Also Negotiates',
        '507': 'Insufficient Storage',
        '509': 'Bandwidth Limit Exceeded',
        '510': 'Not Extended',
        '511': 'Network Authentication Required'
    };



    BEM.decl('i-errors', null, {

        /**
         * @type {CommonError}
         */
        CommonError: CommonError,

        /**
         * @type {HttpError}
         */
        HttpError: HttpError,

        /**
         * check if err is instance of HttpError
         * @param  {Error}  err
         * @return {Boolean}
         */
        isHttpError: function (err) {
            return err instanceof HttpError;
        },

        /**
         * @typedef {*} SerializedError
         * @property {String} name
         * @property {String} message
         */

        /**
         * Serialize error to object without unsafe info
         * @param  {Error} err
         * @return {SerializedError}
         */
        serialize: function (err) {
            if (err instanceof CommonError) {
                return err;
            } else {
                return {
                    name: err.name || 'UnknownError',
                    message: err.message || err.type || 'Unknown Error'
                };
            }
        },

        /**
         * create error from object
         * @param  {SerializedError} obj
         * @return {Error}
         */
        createError: function (obj) {
            var err;
            switch (obj.name) {
                case 'CommonError':
                    err = new CommonError(obj.message);
                    break;
                case 'HttpError':
                    err = new HttpError(obj.status);
                    break;
                default:
                    err = new Error();
                    Object.keys(obj).forEach(function (k) {
                        err[k] = obj[k];
                    });
            }
            return err;
        }
    });
}());