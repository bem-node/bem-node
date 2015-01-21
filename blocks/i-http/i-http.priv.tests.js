describe('i-http.priv.js', function () {

    BEM.decl({block: 'i-test-http', baseBlock: 'i-http'}, null, {
        _apiHost: 'http://127.0.0.1:3001',
        TIMEOUT: '500'
    });

    BEM.decl({block: 'i-test-http-with-ip', baseBlock: 'i-http'}, null, {
        _apiHost: 'http://127.0.0.1:3001',
        TIMEOUT: '500'
    });

    var api = BEM.blocks['i-test-http'];

    it('interface', function () {
        return expect(Vow.all([
            api.get(),
            api.get('url'),
            api.get(null, {foo: 'bar'}),
            api.get('url', {foo: 'bar'})
        ])).be.fulfilled.then(function (responses) {
            responses.forEach(function (r) {
                expect(r.statusCode).equal(200);
                expect(r.headers).instanceof(Object, 'Headers should be instanceof of Object');
                expect(r.body).instanceof(Buffer, 'Result is not instance of Buffer');
            });
        });
    });

    it('result', function () {
        return expect(api.get('test', {foo: 'bar'})
            .then(function (r) {
                var json = JSON.parse(r.body);
                expect(json.handle).equal('test');
                expect(json.params).deep.equal({foo: 'bar'});
            }))
            .be.fulfilled;
    });

    it('ip in _apiHost', function () {
        return expect(BEM.blocks['i-test-http-with-ip'].get('test', {foo: 'bar'}))
            .be.fulfilled;
    });

    describe('errors', function () {
        it('timeout', function () {
            return expect(api.get('timeout')).be.rejectedWith(api.HttpError, 'ETIMEDOUT');
        });
        it('500', function () {
            return expect(api.get('error')).be.fulfilled.then(function (r) {
                expect(r.statusCode).equal(500);
            });
        });
    });


    describe('request wrapper', function () {
        var request = BEM.blocks['i-http'].request,
            requestStream = BEM.blocks['i-http'].requestStream;

        it('request', function () {
            return expect(request({
                url: 'http://127.0.0.1:3001/test',
                qs: {foo: 'baaz'}
            }))
                .be.fulfilled
                .then(function (r) {
                    var body = JSON.parse(r.body);
                    expect(body.params).deep.equal({foo: 'baaz'});
                });
        });

        it('requestStream', function () {
            return expect(requestStream({
                url: 'http://127.0.0.1:3001/stream',
                qs: {qq: 'aa'}
            }).then(function (stream) {
                var st = '',
                    p = Vow.promise();

                stream
                    .on('data', function (chunk) {
                        st += chunk;
                    })
                    .on('error', function (e) {
                        p.reject(e);
                    })
                    .on('end', function () {
                        var body = new Buffer(st).toString('utf8');
                        p.fulfill(body);
                    });
                return p;
            }))
                .be.fulfilled
                .then(function (body) {
                    var json = JSON.parse(body);
                    expect(json.handle).equal('stream');
                    expect(json.params).deep.equal({qq: 'aa'});
                });
        });

    });
});
