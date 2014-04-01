describe('i-router.js', function () {
    describe('define', function () {

        var router = BEM.blocks['i-router'];

        it('define after init', function () {
            var init = false,
                update = false,
                leave = false;
            router.define('/', 'i-router-page-2');

            BEM.decl('i-router-page-2', null, {
                init: function () {
                    init = true;
                    return Vow.fulfill();
                },
                update: function () {
                    update = true;
                    return Vow.fulfill();
                },
                destruct: function () {
                    leave = true;
                    return Vow.fulfill();
                }
            });

            return env('/?s=a', function () {
                return Vow.all([
                    expect(init).to.equal(false, 'page was inited again'),
                    expect(update).to.equal(true, 'page was not updated'),
                    expect(leave).to.equal(false, 'page was left'),
                ]);
            }, true);
        });
    });
});
