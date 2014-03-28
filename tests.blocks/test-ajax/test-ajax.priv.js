BEM.decl('test-ajax', null, {

    simple: function () {
        return Vow.fulfill({});
    },

    double: function (opts) {
        return Vow.fulfill({
            foo: opts.foo * 2
        });
    },

    pow: function (o) {
        return Vow.fulfill(Math.pow(o.a, o.b));
    }

});
