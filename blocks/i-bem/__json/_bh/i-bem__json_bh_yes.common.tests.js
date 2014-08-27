/* jshint expr:true */
describe('i-bem__json_bh_yes', function () {

    var bh = BEM.blocks['i-bh'].bh();

    BEM.JSON.decl('b-test', {
        onBlock: function (ctx) {
            ctx.content({elem: 'item'});
        },
        onElem: {
            'item': function (ctx) {
                ctx.content('test string');
            }
        }
    });

    describe('declaration', function () {
        it('public methods', function () {
            expect(BEM.JSON).to.exist;
            expect(BEM.JSON.decl).to.exist;
        });
    });

    describe('process json', function () {
        var json = bh.processBemJson({block: 'b-test'});
        it('build bemjson', function () {
            expect(json).to.exist;
            expect(json.block).to.exist;
        });

        it('build content', function () {
            expect(json.block).to.be.equal('b-test');
            expect(json.content).to.exist;
        });

        it('build element', function () {
            expect(json.content.elem).to.exist;
            expect(json.content.elem).to.be.equal('item');
            expect(json.content.content).to.be.equal('test string');
        });
    });

    describe('modes', function () {
        BEM.JSON.decl({
            name: 'b-test', modName: 'hasmode', modVal: 'yes'
        }, {
            onBlock: function (ctx) {
                ctx.content([
                    'hasmode='+ctx.mod('hasmode'),
                    {elem: 'item', mods: {'addMode': 'yes'}, content: 'default'},
                    {elem: 'item', mods: {'force': 'yes'}, content: 'default'},
                    {elem: 'item'}
                ], true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.content('changed', ctx.mod('force') === 'yes');
                    if (ctx.mod('addMode') === 'yes') {
                        ctx.mods({
                            addMode: 'added',
                            addedMode: 'yes'
                        }, true);
                    }
                }
            }
        });
        var bemjson = bh.processBemJson({
            block: 'b-test',
            mods: {hasmode: 'yes'}
        });
        it('apply mode', function () {
            expect(Array.isArray(bemjson.content)).to.be.equal(true);
            expect(bemjson.content[0]).to.be.equal('hasmode=yes');
        });
        it('mode forse', function () {
            expect(bemjson.content[1].content).to.be.equal('default');
            expect(bemjson.content[2].content).to.be.equal('changed');
            expect(bemjson.content[3].content).to.be.equal('changed');
        });
    });

    describe('position', function () {
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'position'
        }, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item'},
                    {elem: 'item'},
                    {elem: 'item'}
                ], true);
            },
            onElem: {
                item: function (ctx) {
                    ctx.param('position', ctx.pos());
                    ctx.param('isFirst', ctx.isFirst() ? 'yes' : 'no');
                    ctx.param('isLast', ctx.isLast() ? 'yes' : 'no');
                }
            }
        });
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'position'
        }, {
            onElem: {
                'item': function (ctx) {
                    if (ctx.isLast()) {
                        ctx.content({block: 'b-test-inner', mods: {test: 'position'}});
                    }
                }
            }
        });
        BEM.JSON.decl({
            name:'b-test-inner',
            modName: 'test',
            modVal: 'position'
        }, {
            onBlock: function (ctx) {
                ctx.param('position', ctx.pos());
                ctx.param('isFirst', ctx.isFirst() ? 'yes' : 'no');
                ctx.param('isLast', ctx.isLast() ? 'yes' : 'no');
            }
        });


        var bemjson;
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'position'}});
        it('position', function () {
            expect(bemjson.content[0].position).to.be.equal(1);
            expect(bemjson.content[1].position).to.be.equal(2);
            expect(bemjson.content[2].position).to.be.equal(3);
            expect(bemjson.content[2].content.position).to.be.equal(1);
        });
        it('isLast', function () {
            expect(bemjson.content[0].isLast).to.be.equal('no');
            expect(bemjson.content[1].isLast).to.be.equal('no');
            expect(bemjson.content[2].isLast).to.be.equal('yes');
            expect(bemjson.content[2].content.isLast).to.be.equal('yes');
        });
        it('isFirst', function () {
            expect(bemjson.content[0].isFirst).to.be.equal('yes');
            expect(bemjson.content[1].isFirst).to.be.equal('no');
            expect(bemjson.content[2].isFirst).to.be.equal('no');
            expect(bemjson.content[2].content.isFirst).to.be.equal('yes');
        });
    });

    describe('attrs', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'attrs'
        }, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item', attrs:{test: 'yes'}},
                    {elem: 'item', attrs:{test: 'yes'}, mods: {force: 'yes'}},
                    {elem: 'item', attrs:{}},
                    {elem: 'item'}
                ], true);
            },
            onElem: {
                item: function (ctx) {
                    ctx.attr('test', 'tested', ctx.mod('force') === 'yes');
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'attrs'}});
        it('element attrs', function () {
            expect(bemjson.content[0].attrs.test).to.be.equal('yes');
            expect(bemjson.content[1].attrs.test).to.be.equal('tested');
            expect(bemjson.content[2].attrs.test).to.be.equal('tested');
            expect(bemjson.content[3].attrs.test).to.be.equal('tested');
        });
    });

    describe('mix', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'mix'
        }, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item', mix:[{elem: 'mixed'}], mods: {force: 'yes'}},
                    {elem: 'item', mix:[{elem: 'mixed'}]},
                    {elem: 'item'},
                    {elem: 'item', mods: {force: 'yes'}}
                ], true);
            },
            onElem: {
                item: function (ctx) {
                    ctx.mix({elem: 'test-mix-obj'}, ctx.mod('force') === 'yes');
                    ctx.mix([{elem: 'test-mix-arr'}], ctx.mod('force') === 'yes');
                    ctx.mix([{elem: 'test-mix-add'}]);
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'mix'}});
        it('mix', function () {
            expect(bemjson.content[0].mix).to.exist;

            expect(bemjson.content[0].mix[0].elem).to.be.equal('test-mix-arr');
            expect(bemjson.content[0].mix[1].elem).to.be.equal('test-mix-add');

            expect(bemjson.content[1].mix[0].elem).to.be.equal('mixed');
            expect(bemjson.content[1].mix[1].elem).to.be.equal('test-mix-obj');
            expect(bemjson.content[1].mix[2].elem).to.be.equal('test-mix-arr');
            expect(bemjson.content[1].mix[3].elem).to.be.equal('test-mix-add');

            expect(bemjson.content[2].mix[0].elem).to.be.equal('test-mix-obj');
            expect(bemjson.content[2].mix[1].elem).to.be.equal('test-mix-arr');
            expect(bemjson.content[2].mix[2].elem).to.be.equal('test-mix-add');

            expect(bemjson.content[3].mix[0].elem).to.be.equal('test-mix-arr');
            expect(bemjson.content[3].mix[1].elem).to.be.equal('test-mix-add');

        });
    });

    describe('content wrapers', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'wrap-content'
        }, {
            onBlock: function (ctx) {
                ctx.content({elem:'holder', content: [
                    'string',
                    {elem: 'item', content: 'content'}
                ]});
            },
            onElem: {
                'holder': function (ctx) {
                    ctx.wrapContent({elem: 'wraper'});
                },
                'item': function (ctx) {
                    ctx.beforeContent({elem: 'before'});
                    ctx.beforeContent('before');
                    ctx.afterContent([
                        {elem: 'after'},
                        'after'
                    ]);
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'wrap-content'}});
        it('wrapContent', function () {
            expect(bemjson.content.elem).to.be.equal('holder');
            expect(bemjson.content.content.elem).to.be.equal('wraper');
            expect(bemjson.content.content.content[0]).to.be.equal('string');
            expect(bemjson.content.content.content[1].elem).to.be.equal('item');
        });
        it('before after content', function () {
            var item = bemjson.content.content.content[1];
            expect(item).to.exist;
            expect(item.content).to.exist;
            expect(item.content[0]).to.be.equal('before');
            expect(item.content[1].elem).to.be.equal('before');
            expect(item.content[2]).to.be.equal('content');
            expect(item.content[3].elem).to.be.equal('after');
            expect(item.content[4]).to.be.equal('after');
        });
    });

    describe('wrap', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'wrap'
        }, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'});
                ctx.wrap({block: 'b-test-wraper'});
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wrap({elem: 'wraper'});
                },
                'wraper': function (ctx) {
                    ctx.afterContent('string');
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'wrap'}});
        it('wrap block', function () {
            expect(bemjson).to.exist;
            expect(bemjson.block).to.be.equal('b-test-wraper');
            expect(bemjson.content.block).to.be.equal('b-test');
        });
        it('wrap elem', function () {
            expect(bemjson.content.content).to.exist;
            expect(bemjson.content.content.elem).to.be.equal('wraper');
            expect(bemjson.content.content.content[0]).to.exist;
            expect(bemjson.content.content.content[0].elem).to.be.equal('item');
            expect(bemjson.content.content.content[1]).to.be.equal('string');
        });
    });

    describe('multiple wrap', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'multiple-wrap'
        }, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'});
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wrap({elem: 'wrap-block-level-1'})
                       .wrap({elem: 'wrap-block-level-2'})
                       .wrap({elem: 'wrap-block-level-3'});
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'multiple-wrap'}});
        it('wrap block', function () {
            expect(bemjson).to.exist;
            expect(bemjson.content).to.exist;
            expect(bemjson.content.elem).to.be.equal('wrap-block-level-3');
            expect(bemjson.content.content).to.exist;
            expect(bemjson.content.content.elem).to.be.equal('wrap-block-level-2');
            expect(bemjson.content.content.content).to.exist;
            expect(bemjson.content.content.content.elem).to.be.equal('wrap-block-level-1');
            expect(bemjson.content.content.content.content).to.exist;
            expect(bemjson.content.content.content.content.elem).to.be.equal('item');
        });
    });

    describe('wrap with not BEM obj', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'wrap-no-bem'
        }, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'});
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wrap({elem: 'wrap-block-level-1'})
                       .wrap({tag: 'span'})
                       .wrap({elem: 'wrap-block-level-3'});
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'wrap-no-bem'}});
        it('wrap block', function () {
            expect(bemjson).to.exist;
            expect(bemjson.content).to.exist;
            expect(bemjson.content.elem).to.be.equal('wrap-block-level-3');
            expect(bemjson.content.content).to.exist;
            expect(bemjson.content.content.tag).to.be.equal('span');
            expect(bemjson.content.content.content).to.exist;
            expect(bemjson.content.content.content.elem).to.be.equal('wrap-block-level-1');
            expect(bemjson.content.content.content.content).to.exist;
            expect(bemjson.content.content.content.content.elem).to.be.equal('item');
        });
    });

    describe('generateId', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'generateId'
        }, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'});
                ctx.param('id', ctx.generateId());
            },
            onElem: {
                item: function (ctx) {
                    ctx.param('id', ctx.generateId());
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'generateId'}});
        it('id defined', function () {
            expect(bemjson).to.exist;
            expect(bemjson.id).to.exist;
            expect(bemjson.content.id).to.exist;
        });
        it('ids are not equal', function () {
            expect(bemjson.id).not.to.be.equal(bemjson.content.id);
        });
    });

    describe('stop', function () {
        var bemjson, bemjsonProcessed, bemjsonStoped;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'stop'
        }, {
            onBlock: function (ctx) {
                ctx.mod('processed', 'no');
            }
        });
        BEM.JSON.decl({
            name:'b-test',
            modName: 'processing',
            modVal: 'yes'
        }, {
            onBlock: function (ctx) {
                ctx.mod('processed', 'yes');
            }
        });
        BEM.JSON.decl({
            name:'b-test',
            modName: 'stop-processing',
            modVal: 'yes'
        }, {
            onBlock: function (ctx) {
                ctx.stop();
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'stop'}});
        bemjsonProcessed = bh.processBemJson({block: 'b-test', mods: {
            test: 'stop',
            processing: 'yes'
        }});
        bemjsonStoped = bh.processBemJson({block: 'b-test', mods: {
            test: 'stop',
            processing: 'yes',
            'stop-processing': 'yes'
        }});
        it('processing defined', function () {
            expect(bemjson).to.exist;
            expect(bemjson.mods).to.exist;
            expect(bemjson.mods.processed).to.exist;
            expect(bemjson.mods.processed).to.be.equal('no');
        });
        it('processed', function () {
            expect(bemjsonProcessed.mods.processed).to.be.equal('yes');
        });
        it('processing stoped', function () {
            expect(bemjsonStoped.mods.processed).not.to.exist;
        });
    });


    describe('context', function () {
        var bemjsonContext, bemjsonOtherContext;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'context'
        }, {
            onBlock: function (ctx) {
                ctx.afterContent(this.testMethod(), true);
            },

            testProp: 'context',

            testMethod: function () {
                return this.testProp;
            }
        });
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test-context',
            modVal: 'yes'
        }, {
            onBlock: function (ctx) {
                ctx.beforeContent(this.testProp);
            },

            testProp: 'other-context'

        });
        bemjsonContext = bh.processBemJson({block: 'b-test', mods: {test: 'context'}});
        bemjsonOtherContext = bh.processBemJson({block: 'b-test', mods: {test: 'context', 'test-context': 'yes'}});
        it('context methods and props', function () {
            expect(bemjsonContext).to.exist;
            expect(bemjsonContext.content).to.exist;
            expect(Array.isArray(bemjsonContext.content)).to.be.equal(true);
            expect(bemjsonContext.content.pop()).to.be.equal('context');
        });
        it('multiple context', function () {
            expect(bemjsonOtherContext).to.exist;
            expect(bemjsonOtherContext.content).to.exist;
            expect(Array.isArray(bemjsonOtherContext.content)).to.be.equal(true);
            expect(bemjsonOtherContext.content.pop()).to.be.equal('context');
            expect(bemjsonOtherContext.content.shift()).to.be.equal('other-context');
        });
    });

    describe('nested elems', function () {
        var bemjson;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'nested-elems'
        }, {
            onBlock: function (ctx) {
                ctx.content({
                    elem: 'item-level-1',
                    content: {
                        block: 'b-test-nested-elems',
                        elem: 'item-level-2',
                        content: {
                            elem: 'item-level-3'
                        }
                    }
                }, true);
            },
            onElem: {
                'item-level-3': function (ctx) {
                    ctx.content('b-test', true);
                }
            }
        });
        BEM.JSON.decl('b-test-nested-elems', {
            onElem: {
                'item-level-3': function (ctx) {
                    ctx.content('b-test-nested-elems', true);
                }
            }
        });
        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'nested-elems'}});
        it('context methods and props', function () {
            expect(bemjson).to.exist;
            expect(bemjson.content).to.exist;
            expect(bemjson.content.content).to.exist;
            expect(bemjson.content.content.content).to.exist;
            expect(bemjson.content.content.content.content).to.exist;
            expect(bemjson.content.content.content.content).to.be.equal('b-test-nested-elems');
        });
    });

    describe('remove', function () {
        var bemjson, bemjsonRemoveElem, bemjsonRemoveBlock;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'remove'
        }, {
            onBlock: function (ctx) {
                if (ctx.mod('remove') === 'block') {
                    ctx.remove();
                } else {
                    ctx.content([
                        {elem: 'item', mods: { 'remove':  ctx.mod('remove') }},
                        {elem: 'item'}
                    ], true);
                }
            },
            onElem: {
                'item': function (ctx) {
                    if (ctx.mod('remove') === 'elem') {
                        ctx.remove();
                    }
                }
            }
        });

        bemjson = bh.processBemJson({block: 'b-test', mods: {test: 'remove'}});
        bemjsonRemoveBlock = bh.processBemJson({block: 'b-test', mods: {test: 'remove', remove: 'block'}});
        bemjsonRemoveElem = bh.processBemJson({block: 'b-test', mods: {test: 'remove', remove: 'elem'}});

        it('not removed', function () {
            expect(bemjson).to.exist;
            expect(bemjson.content).to.exist;
            expect(Array.isArray(bemjson.content)).to.be.equal(true);
            expect(bemjson.content[0].elem).to.exist;
            expect(bemjson.content[1].elem).to.exist;
        });
        it('not removed block', function () {
            expect(bemjsonRemoveBlock.block).not.to.be.ok;
        });
        it('not removed element', function () {
            expect(bemjsonRemoveElem).to.exist;
            expect(bemjsonRemoveElem.content).to.exist;
            expect(Array.isArray(bemjsonRemoveElem.content)).to.be.equal(true);
            expect(bemjsonRemoveElem.content[0].elem).not.to.be.ok;
            expect(bemjsonRemoveElem.content[1].elem).to.exist;
        });
    });

    describe('decl error', function () {
        var bemjson, commonOnBlock = 0, commonOnElem = 0;
        BEM.JSON.decl({
            name:'b-test',
            modName: 'common-decl',
            modVal: 'yes'
        }, {
            onBlock: function () {
                commonOnBlock++;
            },
            onElem: {
                'item': function () {
                    commonOnElem++;
                }
            }
        });
        BEM.JSON.decl({
            name:'b-test',
            modName: 'test',
            modVal: 'decl-error'
        }, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item', mods: {
                    error: ctx.mod('elemError')
                }});
                if (ctx.mod('error') === 'yes') {
                    throw new Error('Tets decl error handle');
                }
            },
            onElem: {
                'item': function (ctx) {
                    if (ctx.mod('error') === 'yes') {
                        throw new Error('Tets decl error handle');
                    }
                }
            }
        });

        bemjson = bh.processBemJson([
            {block: 'b-test', mods: {test: 'decl-error', error: 'yes', 'common-decl': 'yes'}},
            {block: 'b-test', mods: {test: 'decl-error', error: 'no', elemError: 'yes', 'common-decl': 'yes'}},
            {block: 'b-test', mods: {test: 'decl-error', error: 'no', elemError: 'no', 'common-decl': 'yes'}},
        ]);

        it ('common decl', function () {
            expect(commonOnElem).to.be.equal(1);
            expect(commonOnBlock).to.be.equal(2);
        });

        it('handle', function () {
            expect(bemjson).to.exist;
            expect(bemjson.length).to.exist;
            expect(bemjson[0].block).not.to.be.ok;
            expect(bemjson[0].elem).not.to.be.ok;
            expect(bemjson[1].block).to.exist;
            expect(bemjson[1].content).to.exist;
            expect(bemjson[1].content.block).not.to.be.ok;
            expect(bemjson[1].content.elem).not.to.be.ok;
            expect(bemjson[2].content).to.exist;
            expect(bemjson[2].content.elem).to.exist;
        });
    });

    it('process async bemjson', function () {

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'async'}, {
            onBlock: function (ctx) {
                ctx.wait();
                setTimeout(function () {
                    ctx.content('async content', true);
                    ctx.resume();
                }, 100);
            }
        });

        return bh.processBemJsonAsync({block: 'b-test', mods: {test: 'async'}}).then(function (json) {
            expect(json).to.be.ok;
            expect(json.content).to.be.equal('async content');
        });

    });

    it('process async multiple elems', function () {

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'multiple-elems'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item-sync'},
                    {elem: 'item-async', timeout: 100},
                    {elem: 'item-async', timeout: 200, mods: {'async-param': 'yes'}}
                ], true);
            },
            onElem: {
                'item-sync': function (ctx) {
                    ctx.content('item-sync');
                },
                'item-async': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.content('item-async');
                        ctx.resume();
                    }, ctx.param('timeout'));
                    if (ctx.mod('async-param') === 'yes') {
                        ctx.wait();
                        setTimeout(function () {
                            ctx.param('async-param', 'yes');
                            ctx.resume();
                        }, ctx.param('timeout'));
                    }
                }
            }
        });

        return bh.processBemJsonAsync({block: 'b-test', mods: {test: 'multiple-elems'}}).then(function (json) {
            expect(json).to.exist;
            expect(json.content).to.exist;
            expect(json.content[0]).to.exist;
            expect(json.content[0].content).to.be.equal('item-sync');
            expect(json.content[1]).to.exist;
            expect(json.content[1].content).to.be.equal('item-async');
            expect(json.content[2]).to.exist;
            expect(json.content[2].content).to.be.equal('item-async');
            expect(json.content[2]['async-param']).to.be.equal('yes');
            expect(typeof json.content[0]['async-param']).to.be.equal('undefined');
            expect(typeof json.content[1]['async-param']).to.be.equal('undefined');
        });
    });

    it('process async for nested blocks', function () {

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'nested-blocks'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'}, true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.content({block: 'b-test', mods: {nested: 'yes'}}, true);
                        ctx.resume();
                    }, 100);
                }
            }
        });

        BEM.JSON.decl({name: 'b-test', modName: 'nested', modVal: 'yes'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item'}, true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.content('async-content', true);
                        ctx.resume();
                    }, 100);
                }
            }
        });

        return bh.processBemJsonAsync({block: 'b-test', mods: {test: 'nested-blocks'}}).then(function (json) {
            expect(json).to.exist;
            expect(json.content).to.exist;
            expect(json.content.content).to.exist;
            expect(json.content.content.content).to.exist;
            expect(json.content.content.content.content).to.be.equal('async-content');
        });

    });

    it('wait for processing decls', function () {

        BEM.JSON.decl({name: 'b-test', modName: 'common-for', modVal: 'wait-for-decls'}, {
            onBlock: function (ctx) {
                ctx.content([
                    String(ctx.params().someParam),
                    {elem: 'item'}
                ]);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.beforeContent('async-item-content');
                        ctx.resume();
                    }, 100);

                }
            }
        });

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'wait-for-decls'}, {
            onBlock: function (ctx) {
                ctx.wait();
                setTimeout(function () {
                    ctx.params().someParam = 'async-content';
                    ctx.resume();
                }, 100);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.content('sync-item-content');
                }
            }
        });

        return bh.processBemJsonAsync({block: 'b-test', mods: {test: 'wait-for-decls', 'common-for': 'wait-for-decls'}}).then(function (json) {
            expect(json).to.exist;
            expect(json.content).to.exist;
            expect(json.content[0]).to.be.equal('async-content');
            expect(json.content[1]).to.exist;
            expect(json.content[1].content).to.exist;
            expect(json.content[1].content[0]).to.be.equal('async-item-content');
            expect(json.content[1].content[1]).to.be.equal('sync-item-content');
        });

    });

    it('async remove', function () {


        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'async-remove'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item', content: 'test string'}, true);
            },
            onElem: {
                item: function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.remove();
                        ctx.resume();
                    }, 100);
                }
            }
        });

        return bh.processBemJsonAsync({block: 'b-test', mods: {test: 'async-remove'}}).then(function (json) {
            expect(json).to.exist;
            expect(json.content.block).not.to.be.ok;
            expect(json.content.elem).not.to.be.ok;
        });

    });

    it('async remove from array', function () {

        BEM.JSON.decl({name: 'b-test', modName: 'test', modVal: 'async-remove-from-arr'}, {
            onBlock: function (ctx) {
                ctx.content([
                    {elem: 'item', content: 'test string'},
                    {elem: 'item2', content: 'test string'}
                ], true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.remove();
                        ctx.resume();
                    }, 100);
                }
            }
        });

        return bh.processBemJsonAsync({block: 'b-test', mods: {test: 'async-remove-from-arr'}}).then(function (json) {
            expect(json).to.exist;
            expect(json.content).to.exist;
            expect(json.content.block).not.to.be.ok;
            expect(json.content.elem).not.to.be.ok;
            expect(json.content[1].content).to.be.equal('test string');
        });

    });

    it('async wrap', function () {

        BEM.JSON.decl({name: 'b-test-wrap', modName: 'test', modVal: 'async-wrap'}, {
            onBlock: function (ctx) {
                ctx.content({elem: 'item', content: 'test string'}, true);
            },
            onElem: {
                'item': function (ctx) {
                    ctx.wait();
                    setTimeout(function () {
                        ctx.wrap({elem: 'item-wraper', block: 'b-test-wrap'});
                        ctx.resume();
                    }, 100);
                }
            }
        });

        return bh.processBemJsonAsync({block: 'b-test-wrap', mods: {test: 'async-wrap'}}).then(function (json) {
            expect(json).to.exist;
            expect(json.content).to.exist;
            expect(json.content.elem).to.be.equal('item-wraper');
            expect(json.content.content).to.exist;
            expect(json.content.content.elem).to.be.equal('item');
            expect(json.content.content.content).to.be.equal('test string');
        });

    });


});