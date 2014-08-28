BEM.decl('test-ajax', null, {
    _decorators: [
        function (method, args) {
            if (method === 'double' && (args[0].foo === 100 || args[0].foo === 200)) {
                args[0].foo += 100;
            }
            return Vow.fulfill();
        },
        function (method, args, requestOptions) {
            if (method === 'headers') {
                requestOptions.headers['x-user-num'] = 2;
            }
            return Vow.fulfill();
        }
    ],

    headers: function () {
        return this.invoke('headers', arguments);
    },

    simple: function () {
        return this.invoke('simple', arguments);
    },

    double: function () {
        return this.invoke('double', arguments);
    },

    pow: function () {
        return this.invoke('pow', arguments);
    },

    getNumber: function () {
        return this.invoke('getNumber', arguments);
    },

    getString: function () {
        return this.invoke('getString', arguments);
    },

    getArray: function () {
        return this.invoke('getArray', arguments);
    },

    getNotFound: function () {
        return this.invoke('getNotFound', arguments);
    },

    getJSON: function () {
        return this.invoke('getJSON', arguments);
    },

    allowedButNotExist: function () {
        return this.invoke('allowedButNotExist', arguments);
    }

});
