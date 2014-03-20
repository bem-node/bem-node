describe('i-router.priv', function () {
    it('404', function (done) {
        env('/ololo', function (meta) {
            expect(meta.statusCode).equal(404);
            done();
        }).done();
    });
});
