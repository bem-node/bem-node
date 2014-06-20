BEM.decl('test-ajax-cached', null, {

    cacheMe: function () {
        return Vow.fulfill('cached!');
    },

    cacheMeLittle: function () {
        return Vow.fulfill('cached!');
    }

});
