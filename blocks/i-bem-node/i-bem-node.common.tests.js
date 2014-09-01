/*global BN */
(function () {
    var global = this;
    describe('i-bem-node.common.js', function () {
        it('common api methods', function () {
            expect(BN).to.be.an('function');
            expect(BN.addDecl).to.be.an('function');
        });
        it('generator api methods', function () {
            var g = BN.addDecl('generator-api-test-block');
            expect(g).to.be.an('object');
            expect(g.baseBlock).to.be.an('function');
            expect(g.staticProp).to.be.an('function');
            expect(g.instanceProp).to.be.an('function');
            expect(g.onSetMod).to.be.an('function');
            expect(g.blockTemplate).to.be.an('function');
            expect(g.elemTemplate).to.be.an('function');
            expect(g.dataTemplate).to.be.an('function');
            expect(g.done).to.be.an('function');
        });
        if (global.document) {
            describe('client tests', function () {
                it('js true for blocks with init', function () {
                    BN.addDecl('tets-block-js-true').instanceProp({
                        init: function () {
                            this.testField = 'testField';
                        }
                    }).done();
                    var block = jQuery(BN('i-content').html({
                        block: 'tets-block-js-true'
                    }, true)).bem('tets-block-js-true');
                    expect(block).to.be.an('object');
                    expect(block.testField).to.be.equal('testField');
                });
            });
        }
        it('temaplte params', function () {
            var bh = BEM.blocks['i-bh'].bh();
            BN.addDecl('temaplte-params-test').blockTemplate(function (ctx, params) {
                params.testDataCheck = params.testData;
                ctx.content({
                    elem: 'elem-1',
                    content: {
                        elem: 'elem-2'
                    }
                });
            }).elemTemplate({
                'elem-2': function (ctx, params) {
                    params.testData = ctx.parentBlock().testData;
                }
            }).done();
            var bemjson = bh.processBemJson({block: 'temaplte-params-test', testData: 'TEST_DATA'});
            expect(bemjson.testData).equal('TEST_DATA');
            expect(bemjson.testDataCheck).equal('TEST_DATA');
            expect(bemjson.content.content.testData).equal('TEST_DATA');
        });
    });
}());
