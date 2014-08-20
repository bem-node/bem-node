(function () {
    describe('i-enb', function () {
        it('css', function () {
            var testBlock = jQuery('<div class="test-i-enb"></div>');
            testBlock.appendTo('body');
            expect(Number(testBlock.css('opacity'))).equal(0.5);
        });
        it('load existing file', function () {
            return jQuery.get('/tests/i-enb/i-enb.css');
        });
        it('load unexisting file', function () {
            var p = Vow.promise();
            jQuery.get('/tests/i-enb/none.css').done(function () {
                p.reject(new Error('/tests/i-enb/none.css should not found'));
            }).fail(function (xhr) {
                expect(xhr.status).not.equal(200);
                p.fulfill();
            });
            return p;
        });
    });
}());
