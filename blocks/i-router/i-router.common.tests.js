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

        it ('params', function (done) {
            env('/foo?qwe=123', function (meta) {
                expect(router.getParams().qwe).equal('123');
                done();
            }).done();
        });
        it ('params', function (done) {
            env('/foo?p1=123?4&p2=%20567', function (meta) {
                expect(router.getParams().p1).equal('123?4');
                expect(router.getParams().p2).equal(' 567');
                done();
            }).done();
        });
    }); 
});
