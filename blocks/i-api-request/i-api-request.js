/**
 * Request json api from browser
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
     * Drop request cache of current block
     *
     * @abstract
     * @name dropCache
     * @type Function
     */

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
        data.ncrd = Date.now();
        if (data.params) {
            data.params = JSON.stringify(data.params);
        }
        if (data && data.body) {
            data.body = this._normalizeBody(data.body);
        }
        if (method !== 'get') {
            this.dropCache();
        }
        this._activeXhrs = this._activeXhrs || [];
        BEM.channel('i-api-request').trigger('beforerequest');
        this._activeXhrs.push(jQuery.ajax({
            type: data.body ? 'POST' : 'GET',
            url: '/ajax/' + this._name + '/' + method,
            data: data,
            complete: function (xhr) {
                var error;
                if (xhr.status === 200) {
                    _this._parse(promise, xhr.responseText);
                } else {
                    error = new _this._HttpError(xhr.status, xhr.statusText, xhr.responseText);
                    BEM.channel('i-api-request').trigger('error', error);
                    promise.reject(error);
                }
                _this._activeXhrs = _this._activeXhrs.filter(function (xhrItem) {
                    return xhr !== xhrItem;
                });
                BEM.channel('i-api-request').trigger('afterrequest');
            }
        }));

        return promise;
    }

});
