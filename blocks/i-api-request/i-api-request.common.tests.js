describe('i-api-request.common.js', function () {

    var api = BEM.blocks['i-test-api'],
        apiHttps = BEM.blocks['i-test-api-https'];

    it('resourse only', function () {
        return env(function () {
            return api.get('source');
        }).then(function (response) {
            return expect(response.handle).equal('source');
        });
    });

    it('with params', function () {
        return env(function () {
            return api.get('source', {params: {foo: 'bar'}});
        }).then(function (response) {
            return expect(response.params.foo).equal('bar');
        });
    });

    it('with params with %', function () {
        return env(function () {
            return api.get('source', {params: {foo: '%bar'}});
        }).then(function (response) {
            return expect(response.params.foo).equal('%bar');
        });
    });

    it('cache in state', function () {
        return env(function () {
            return Vow.all([
                api.get('handle1', {params: {foo: 'bar'}}),
                api.get('handle1', {params: {foo: 'bar'}})
            ]);
        }).spread(function (r1, r2) {
            return expect(r1.responseId).equal(r2.responseId, 'cache is not working');
        });
    });

    it('drop cache after post', function () {
        return env(function () {
            var responseId;
            return api.get('data', {params: {p: 1}})
                .then(function (response) {
                    responseId = response.responseId;
                    return api.post('data', {params: {p: 2}});
                })
                .then(function () {
                    return api.get('data', {params: {p: 1}});
                })
                .then(function (response) {
                    return expect(responseId).not.equal(response.responseId);
                });
        });
    });

    it('drop cache', function () {
        return env(function () {
            var responseId;
            return api.get('data', {params: {p: 1}})
                .then(function (response) {
                    responseId = response.responseId;
                    api.dropCache();
                    return api.get('data', {params: {p: 1}});
                })
                .then(function (response) {
                    return expect(responseId).not.equal(response.responseId);
                });
        });
    });

    it('gets https', function () {
        return env(function () {
            return apiHttps.get('source');
        }).then(function (response) {
            return expect(response.handle).equal('source');
        });
    });

    //TODO: XMLHttpRequest status is 0  in phantom
    describe('errors', function () {

        it('Request Time-out', function () {
            return expect(env(function () {
                return api.get('timeout');
            })).to.be.rejectedWith(api._HttpError/*, 'Request Time-out'*/);
        });

        it('Bad Request', function () {
            return expect(env(function () {
                return api.get('secret?uid=123');
            })).to.be.rejectedWith(api._HttpError/*, 'Bad Request'*/);
        });

        it('Internal Server Error', function () {
            return expect(env(function () {
                return api.get('error');
            })).to.be.rejectedWith(api._HttpError/*, 'Internal Server Error'*/);
        });

    });

});
