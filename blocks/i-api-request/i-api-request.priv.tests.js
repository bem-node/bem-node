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

    describe('dns loopup', function () {
        var api2 = BEM.decl({block: 'i-test-api-2', baseBlock: 'i-api-request'}, null, {
            _apiHost: 'http://127.0.0.1:3001/'
        });

        it('ip as domain', function () {
            return env(function () {
                return expect(api2.get('handle2')).be.fulfilled;
            });
        });
    });
});
