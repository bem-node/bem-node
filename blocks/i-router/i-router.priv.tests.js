describe('i-router.priv', function () {
    var router = BEM.blocks['i-router'];

    it('404', function (done) { 
        env('/ololo', function (meta) {
            expect(meta.statusCode).equal(404);
            done();
        }).done();
    }); 
});
