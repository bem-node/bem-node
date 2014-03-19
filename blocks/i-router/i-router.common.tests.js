describe('i-router.common', function () {
    var router = BEM.blocks['i-router'];

    describe('define', function () { 
        router.define('GET', /\/(foo)/, 'i-router-page-1');
        BEM.decl('i-router-page-1', null, {
            init: function () {
                router.getRes().end();
                return Vow.fulfill();
            }
        });

        it ('params', function () {
            return expect(env('/foo?qwe=123', function (meta) {
                return router.getParams().qwe;
            })).eventually.equal('123');
        });

        it ('? in params', function () {
            return expect(env('/foo?bar=123?4&p2=3333', function (meta) {
                return router.getParams().bar;
            })).eventually.equal('123?4');
        });

        it ('= in params', function () {
            return expect(env('/foo?bar=2=3&p2=3333', function (meta) {
                return router.getParams().bar;
            })).eventually.equal('2=3');
        });

        it ('% in params', function () {
            return expect(env('/foo?bar=%', function () {
                return router.getParams().bar;
            })).eventually.equal('%');
        });


    }); 
});
