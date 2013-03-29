/*global describe: false, it: false, waitsFor: false, runs: false, expect: false */
/**
 * Test for ctx.defer in BEM.JSON
 */
describe('_defer bem-json', function () {

    var fulfillAsync = function (content) {
        var promise = Vow.promise();
        setTimeout(function () {
            promise.fulfill(content);
        }, 100);
        return promise;
    }, rejectAsync = function (content) {
        var promise = Vow.promise();
        setTimeout(function () {
            promise.reject(content);
        }, 100);
        return promise;
    };

    BEM.JSON.decl('b-test-defer', {
        onBlock: function (ctx) {
            ctx.content(
                {elem: 'item', data: ctx.params().data}
            );
        },

        onElem: {
            item: function (ctx) {
                ctx.content(ctx.params().data);
            }
        }
    });

    it('base usage', function () {
        var bemjson;

        BEM.JSON.decl({name: 'b-test-defer', modName: 'test', modVal: 'base'}, {
            onBlock: function (ctx) {
                ctx.defer(fulfillAsync('test string').then(function (content) {
                    ctx.param('data', content);
                }));
            }
        });

        BEM.JSON.buildAsync({block: 'b-test-defer', mods: {test: 'base'}}, function (bemjsonParam) {
            bemjson = bemjsonParam;
        });

        waitsFor(function () {
            return bemjson;
        }, 'bemjson never builded', 1000);

        runs(function () {
            expect(bemjson).toBeDefined();
            expect(bemjson.content).toBeDefined();
            expect(bemjson.content.elem).toBe('item');
            expect(bemjson.content.content).toBe('test string');
        });
    });

    it('defered elem', function () {
        var bemjson, test = 'defered-elem';

        BEM.JSON.decl({name: 'b-test-defer', modName: 'test', modVal: test}, {
            onBlock: function (ctx) {
                ctx.defer(fulfillAsync('test string').then(function (content) {
                    ctx.param('data', content);
                }));
            },
            onElem: {
                item: function (ctx) {
                    ctx.defer(fulfillAsync(ctx.params().data + ' defered').then(function (content) {
                        ctx.param('data', content, true);
                    }));
                }
            }
        });

        BEM.JSON.buildAsync({block: 'b-test-defer', mods: {test: test}}, function (bemjsonParam) {
            bemjson = bemjsonParam;
        });

        waitsFor(function () {
            return bemjson;
        }, 'bemjson never builded', 1000);

        runs(function () {
            expect(bemjson).toBeDefined();
            expect(bemjson.content).toBeDefined();
            expect(bemjson.content.elem).toBe('item');
            expect(bemjson.content.content).toBe('test string defered');
        });
    });

    it('rejected block', function () {
        var bemjson, test = 'rejected-block';

        BEM.JSON.decl({name: 'b-test-defer', modName: 'test', modVal: test}, {
            onBlock: function (ctx) {
                ctx.defer(rejectAsync('test string').then(function (content) {
                    ctx.param('data', content);
                }));
            }
        });

        BEM.JSON.buildAsync({
            block: 'b-test-defer-wraper',
            content: {block: 'b-test-defer', mods: {test: test}}
        }, function (bemjsonParam) {
            bemjson = bemjsonParam;
        });

        waitsFor(function () {
            return bemjson;
        }, 'bemjson never builded', 1000);

        runs(function () {
            expect(bemjson).toBeDefined();
            expect(bemjson.content).toBe(null);
        });
    });
});
