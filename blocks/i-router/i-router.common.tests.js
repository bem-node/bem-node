describe('i-router.common', function () {
    var router = BEM.blocks['i-router'];

    describe('params', function () {
        router.define('GET', /\/(foo)/, 'i-router-page-1');

        BEM.decl('i-router-page-1', null, {
            init: function () {
                router.getRes().end();
                return Vow.fulfill();
            },
            destruct: function () {
                return Vow.fulfill();
            }
        });
        describe('key-value pairs', function () {
            it('empty', function () {
                return env('/foo?', function () {
                    expect(router.getParams()).deep.equal({});
                });
            });
            it('=foo', function () {
                return env('/foo?=foo', function () {
                    expect(router.getParams()).deep.equal({'': 'foo'});
                });
            });
            it('foo=', function () {
                return env('/foo?foo=', function () {
                    expect(router.getParams()).deep.equal({'foo': ''});
                });
            });
            it('=', function () {
                return env('/foo?=', function () {
                    expect(router.getParams()).deep.equal({'': ''});
                });
            });
        });

        it('simple', function () {
            return expect(env('/foo?qwe=123', function () {
                return router.getParams().qwe;
            })).eventually.equal('123');
        });

        it('? in params', function () {
            return expect(env('/foo?bar=123?4&p2=3333', function () {
                return router.getParams().bar;
            })).eventually.equal('123?4');
        });

        it('= in params', function () {
            return expect(env('/foo?bar=2=3&p2=3333', function () {
                return router.getParams().bar;
            })).eventually.equal('2=3');
        });

        it('% in params', function () {
            return expect(env('/foo?bar=%', function () {
                return router.getParams().bar;
            })).eventually.equal('%');
        });

        it('complex', function () {
            return expect(env('/foo?filter=timezone%3D%3DGMT%2B05%3A45', function () {
                return router.getParams().filter;
            })).eventually.equal('timezone==GMT+05:45');
        });


    });
});
