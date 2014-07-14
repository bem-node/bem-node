BEM.decl('test-ajax', null, {

    simple: function () {
        return Vow.fulfill({});
    },

    double: function (opts) {
        return Vow.fulfill({
            foo: opts.foo * 2
        });
    },

    pow: function (opts) {
        return Vow.fulfill(Math.pow(opts.a, opts.b));
    },

    getNumber: function (opts) {
        return Vow.fulfill(Number(opts.num));
    },

    getString: function (opts) {
        return Vow.fulfill(String(opts.st));
    },

    getArray: function (opts) {
        return Vow.fulfill(opts.foo.split(','));
    },

    getJSON: function (num) {
        return Vow.fulfill({foo: num});
    },

    headers: function (num) {
        var headers = BEM.blocks['i-router'].getReq().headers;
        return Vow.fulfill({foo: num * headers['x-user-num']});
    }

});
