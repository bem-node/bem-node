BEM.decl({block: 'i-test-api', baseBlock: 'i-api-request'}, null, {

    post: function (r, p) {
        return this._request('post', r, p);
    }

});
