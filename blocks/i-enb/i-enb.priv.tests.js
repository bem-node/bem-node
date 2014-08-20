(function () {
    describe('i-enb.priv.js', function () {
        it('404', function () {
            return env('/tests/i-enb/none.css', function (meta) {
                expect(meta.statusCode).equal(404);
            });
        });
    });
}());
