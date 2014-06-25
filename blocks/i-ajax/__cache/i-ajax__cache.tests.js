describe('i-ajax__cache.js', function () {
    
    function extraLogic(obj, methodName, fn) {
        var method = obj[methodName];
        obj[methodName] = function () {
            fn.apply(null, arguments);
            return method.apply(obj, arguments);
        };
        obj[methodName].restore = function () {
            obj[methodName] = method;
        };
    }

    var ajax = BEM.blocks['test-ajax-cached'];

    describe('ajax cache', function () {
        it('cached', function () {
            var timesCall = 0;
            extraLogic(jQuery, 'ajax', function () {
                timesCall ++;
            });

            return Vow.all([
                ajax.cacheMe(),
                ajax.cacheMe()
            ]).spread(function (r1, r2) {
                jQuery.ajax.restore();
                expect(r1).equal('cached!');
                expect(r2).equal('cached!');
                expect(timesCall).equal(1, 'cached ajax was callen 2 times intead of 1');
            });
        });


        it('cached with timeout', function () {
            var timesCall = 0;
            extraLogic(jQuery, 'ajax', function () {
                timesCall ++;
            });

            ajax.cacheMeLittle().then(function (r1) {
                expect(r1).equal('cached!');
                setTimeout(function () {
                    ajax.cacheMeLittle().then(function (r2) {
                        expect(r2).equal('cached!');
                        expect(timesCall).equal(2, 'timeouted cache ajax was callen 1 time intead of 2');
                    });
                }, 2000);
            });
        });

        it('clean cache', function () {
            var timesCall = 0;
            extraLogic(jQuery, 'ajax', function () {
                timesCall ++;
            });

            ajax.cacheMe().then(function (r1) {
                expect(r1).equal('cached!');
                BEM.blocks['i-ajax'].cleanCache();
                ajax.cacheMe().then(function (r2) {
                    expect(r2).equal('cached!');
                    expect(timesCall).equal(2, 'cache cleaned ajax was callen 1 time intead of 2');
                });
            });
        });

    });

});
