describe('i-ajax.js', function () {

    BEM.decl(
        {name: 'ajax-block-2', baseBlock: 'i-ajax'},
        null, {
            _allowAjax: [
                'anotherMethod'
            ]
        }
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
        ajax._requestDebounce = false;
        return Vow.all([
            expect(ajax.simple()).to.be.fulfilled,
            expect(ajax.allowedButNotExist()).to.be.rejectedWith(ajax._HttpError),
            expect(ajax.existButNotAllowed).a('undefined')
        ]);
    });

    describe('ajax methods use', function () {

        it('small requests', function () {
            var lastMethod;
            jQuery(document).ajaxSend(function () {
                var settings = arguments[2];
                var requestsStr = settings.url + settings.data;
                if (requestsStr.match('SMALL_REQUEST')) {
                    lastMethod = settings.type;
                }
            });
            return ajax.simple({SMALL_REQUEST:1}).then(function () {
                expect(lastMethod).to.be.equal('GET');
            });
        });

        it('large requests', function () {
            var lastMethod;
            var i = 2049, str = '';
            while (i--) {
                str += 'a';
            }
            jQuery(document).ajaxSend(function () {
                var settings = arguments[2];
                var requestsStr = settings.url + settings.data;
                if (requestsStr.match('LARGE_REQUEST')) {
                    lastMethod = settings.type;
                }
            });
            return ajax.simple({LARGE_REQUEST: str}).then(function () {
                expect(lastMethod).to.be.equal('POST');
            });
        });
    });

    describe('debounce', function () {

        it('not debounced yet', function () {
            var timesCall = 0;
            jQuery(document).ajaxSend(function () {
                var settings = arguments[2];
                var requestsStr = settings.url + settings.data;
                if (requestsStr.match('NOT_DEBOUNCED')) {
                    timesCall++;
                }
            });

            ajax._requestDebounce = false;

            return Vow.all([
                ajax.double({foo: 1, NOT_DEBOUNCED: true}),
                ajax.double({foo: 2, NOT_DEBOUNCED: true})
            ]).spread(function () {
                expect(timesCall).equal(2);
            });
        });


        it('debounced', function () {
            var timesCall = 0;
            jQuery(document).ajaxSend(function () {
                var settings = arguments[2];
                var requestsStr = settings.url + settings.data;
                if (requestsStr.match('DEBOUNCED')) {
                    timesCall++;
                }
            });


            ajax._requestDebounce = true;

            return Vow.all([
                ajax.double({foo: 3, DEBOUNCED: true}),
                ajax.double({foo: 4, DEBOUNCED: true}),
                ajax.pow({a: 3, b: 4, DEBOUNCED: true})
            ]).spread(function (r1, r2, r3) {
                ajax._requestDebounce = false;
                expect(timesCall).equal(1, 'ajax was callen 2 times intead of 1');
                expect(r1.foo).equal(6);
                expect(r2.foo).equal(8);
                expect(r3).equal(81);
            });

        });

    });

    describe('decorators', function () {

        it('should modify arguments for single request', function () {
            ajax._requestDebounce = false;
            return expect(ajax.double({foo: 100}).then(function (resp) {
                return expect(resp.foo).equal(400);
            })).be.fulfilled;
        });

        it('should modify arguments for multiple requests', function () {
            ajax._requestDebounce = true;
            return Vow.all([
                ajax.double({foo: 100}),
                ajax.double({foo: 200})
            ]).spread(function (first, second) {
                expect(first.foo).equal(400);
                expect(second.foo).equal(600);
            });
        });

        it('should add custom headers for single request', function () {
            ajax._requestDebounce = false;
            return expect(ajax.headers(100).then(function (resp) {
                return expect(resp.foo).equal(200);
            })).be.fulfilled;
        });

        it('should add custom headers for multiple requests', function () {
            ajax._requestDebounce = true;
            return Vow.all([
                ajax.headers(100),
                ajax.headers(200)
            ]).spread(function (first, second) {
                expect(first.foo).equal(200);
                expect(second.foo).equal(400);
            });
        });

    });

});
