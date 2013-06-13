/**
 * Request json api, with debounce
 */
BEM.decl('i-api-request', null, {

    _nextTick: function (callback) {
        process.nextTick(callback);
    }

});

