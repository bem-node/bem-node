/**
 * Api format
 *
 * i-test-api-debounced support debounce only with 'id' param
 *
 * /debounced?id=1    ->   {result: {1: 'result_1'}}
 * /debounced?id=2    ->   {result: {1: 'result_2'}}
 * /debounced?id=1,2  ->   {result: {1: 'result_1', 2: 'result_2'}}
 */
describe('i-api-request__debounce.common.js', function () {

    var api = BEM.blocks['i-test-api-debounced'];

    it('debounce with correct param', function () {
        return env(function () {
            var p1 = api.get('debounced', {params: {id: 1}}),
                p2 = api.get('debounced', {params: {id: 2}});

            return Vow.all([p1, p2]).spread(function (r1, r2) {
                return Vow.all([
                    expect(r1.responseId).equal(r2.responseId, 'queryes was not debounced'),
                    expect(r1.result[1]).equal('result_1'),
                    expect(r1.result[2]).equal('result_2')
                ]);
            });
        });
    });

    it('no debounce with incorrent param', function () {
        return env(function () {
            var p1 = api.get('debounced', {params: {foo: 1}}),
                p2 = api.get('debounced', {params: {foo: 2}});

            return Vow.all([p1, p2]).spread(function (r1, r2) {
                return expect(r1.responseId).not.equal(r2.responseId, 'queryes was debounced');
            });
        });
    });

});
