describe('i-api-request', function () {

    var api = BEM.blocks['i-test-api'];

    it('resourse only', function () {
        return expect(env(function () {
            return api.get('index.json');
        })).eventually.have.property('source');
    });

    it('params', function () {
        return expect(env(function () {
            return api.get('index.json', {params: {foo: '%bar'}});
        })).eventually.have.property('source');
    });

});
