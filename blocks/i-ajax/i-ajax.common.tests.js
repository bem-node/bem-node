describe('i-ajax.common.js', function () {
    var ajax = BEM.blocks['test-ajax'];
    var errors = BEM.blocks['i-errors'];

    describe('result type', function () {
        it('number', function () {
            return Vow.all([
                expect(ajax.getNumber({num: 18})).fulfilled.eventually.equal(18),
                expect(ajax.getNumber({num: '20'})).fulfilled.eventually.equal(20),
            ]);
        });

        it('string', function () {
            return Vow.all([
                expect(ajax.getString({st: 18})).fulfilled.eventually.equal('18'),
                expect(ajax.getString({st: 'qwe'})).fulfilled.eventually.equal('qwe')
            ]);
        });

        it('array', function () {
            expect(ajax.getArray({foo: 'qwe,asd'})).fulfilled.eventually.deep.equal(['qwe', 'asd']);
        });

        it('json', function () {
            expect(ajax.getJSON(123)).fulfilled.eventually.deep.equal({foo: 123});
        });
    });

    describe('errors', function () {
        it('error', function () {
            return ajax.getNotFound().always(function (p) {
                expect(p.valueOf() instanceof errors.HttpError).to.be.true;
            });
        });
    });
});
