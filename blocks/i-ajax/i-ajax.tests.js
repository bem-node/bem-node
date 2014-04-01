describe('i-ajax.js', function () {
    
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

    BEM.decl(
        {name: 'ajax-block-2', baseBlock: 'i-ajax'},
        null,
        BEM.blocks['i-ajax'].create([
            'anotherMethod'
        ])
    );

    var ajax = BEM.blocks['test-ajax'],
        notAllowed = BEM.blocks['ajax-block-2'];

    it('allowed methods', function () {
        expect(ajax.simple).a('function');
        expect(ajax.double).a('function');
        expect(notAllowed.simple).a('undefined');
    });

    it('interface', function () {
        expect(Vow.isPromise(ajax.simple())).equal(true, 'allowed methods should retuns a promise');
    });

    it('security policy', function () {
        return Vow.all([
            expect(ajax.simple()).to.be.fulfilled,
            expect(ajax.allowedButNotExist()).to.be.rejectedWith(ajax._HttpError),
            expect(ajax.existButNotAllowed).a('undefined'),
        ]);
    });

    describe('ajax methods use', function () {
        it('small', function () {
            var methodCallen;

            extraLogic(jQuery, 'ajax', function (opts) {
                methodCallen = opts.type;
            });
            
            return expect(ajax.simple({num: 1}).then(function () {
                jQuery.ajax.restore();
                return expect(methodCallen).to.equal('get', 'Method for small requests is not "get"');
            })).be.fulfilled;
        });

        it('big', function () {
            var body = '',
                methodCallen, i;

            extraLogic(jQuery, 'ajax', function (opts) {
                methodCallen = opts.type;
            });
            
            for (i = 0; i < 2049; i++) {
                body += i;
            }

            return expect(ajax.simple({num: body}).then(function () {
                jQuery.ajax.restore();
                return expect(methodCallen).to.equal('post', 'Method for large requests is not "post"');
            })).be.fulfilled;
        });
    });

    describe('debounce', function () {
        it('not debounced yet', function () {
            var timesCall = 0;
            extraLogic(jQuery, 'ajax', function () {
                timesCall ++;
            });

            return Vow.all([
                ajax.double({foo: 1}),
                ajax.double({foo: 2})
            ]).spread(function () {
                jQuery.ajax.restore();
                expect(timesCall).equal(2);
            });
        });


        it('debounced', function () {


            var timesCall = 0;
            extraLogic(jQuery, 'ajax', function () {
                timesCall ++;
            });
            ajax._requestDebounce = true;

            return Vow.all([
                ajax.double({foo: 3}),
                ajax.double({foo: 4}),
                ajax.pow({a: 3, b: 4})
            ]).spread(function (r1, r2, r3) {
                ajax._requestDebounce = false;
                jQuery.ajax.restore();
                expect(timesCall).equal(1, 'ajax was callen 2 times intead of 1');
                expect(r1.foo).equal(6);
                expect(r2.foo).equal(8);
                expect(r3).equal(81);
            });

        });

    });

});
