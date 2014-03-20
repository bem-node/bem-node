describe('i-api-request.priv.js', function () {

    var api = BEM.blocks['i-test-api'];

    it('cache not in state', function () {
        return Vow.all([
            env(function () {
                return api.get('handle2', {params: {foo: 'bar'}});
            }),
            env(function () {
                return api.get('handle2', {params: {foo: 'bar'}});
            })
        ]).spread(function (r1, r2) {
            return expect(r1.responseId).not.equal(r2.responseId, 'cache should works only within state');
        });
    });
});
