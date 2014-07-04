BEM.decl('test-ajax', null, {

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

    getJSON: function () {
        return this.invoke('getJSON', arguments);
    },

    allowedButNotExist: function () {
        return this.invoke('allowedButNotExist', arguments);
    }

});
