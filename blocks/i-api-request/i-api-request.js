/**
 * Request json api
 */

BEM.decl('i-api-request', null, {

    /**
     *  Aborts all active requests
     */
    abort: function () {
        if (this._activeXhrs) {
            while (this._activeXhrs.length) {
                this._activeXhrs.pop().abort();
            }
        }
    },

    /**
     *  Http request rest api
     *
     *  @param {String} method Http method
     *  @param {String} resource
     *  @param {Object} data
     *  @param {Object} [data.params] Get params
     *  @return {Vow.Promise}
     */
    _request: function (method, resource, data) {
        var promise = Vow.promise(),
            _this = this;
        data = data || {};
        data.resource = this._normalizeResource(resource);
        if (data.params) {
            data.params = JSON.stringify(data.params);
        }
        this._activeXhrs = this._activeXhrs || [];

        this._activeXhrs.push(jQuery.ajax({
            type: data.body ? 'POST' : 'GET',
            url: '/ajax/' + this._name + '/' + method,
            data: data,
            complete: function (xhr) {
                if (xhr.status === 200) {
                    _this._parse(promise, xhr.responseText, data.output);
                } else {
                    promise.reject(new _this._HttpError(xhr.status, xhr.statusText, xhr.responseText));
                }
                _this._activeXhrs = _this._activeXhrs.filter(function (xhrItem) {
                    return xhr !== xhrItem;
                });
            }
        }));

        return promise;
    }

});
