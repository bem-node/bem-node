describe('BEM data bindings for BEM.DOM', function () {

    var text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'.split(/,\s|\.\s|\s/),
        txtLen = text.length,
        blockIdx = 0;

    function randomValue() {
        return [
            text[Math.round(Math.random() * txtLen)],
            text[Math.round(Math.random() * txtLen)],
            text[Math.round(Math.random() * txtLen)]
        ].join(' ');
    }

    function staticBlock(props) {
        return BEM.decl('b-test-' + blockIdx++, null, props);
    }

    function dynamicBlock(props) {
        return BEM.decl('b-test-' + blockIdx++, props);
    }


    describe('data binding method', function () {
        var block1, block2;

        describe('should be defined', function () {
            BEM.decl('b-test', {foo: 'bar'}, {baz: 'foo'});

            ['BEM.DOM', 'BEM.blocks[\'b-test\']', 'jQuery(\'<span></span>\').bem(\'b-test\')'].forEach(function (context) {
                var scope = eval(context);
                it('method "bindToData" works in "' + context + '"', function () {
                    expect(typeof scope.bindToData === 'function').toBeTruthy();
                    expect(function () {
                        scope.bindToData('p1', {initAccessor: 'initVal'});
                    }).not.toThrow();
                    expect(function () {
                        scope.bindToData({
                            p2: {get: '_getAccessor', set: '_setAccessor'},
                            p3: {accessor: '_accessor', event: 'nonexistingevent'}
                        });
                    }).not.toThrow();
                });
                it('method "dataBindVal" works in "' + context + '"', function () {
                    expect(typeof scope.dataBindVal === 'function').toBeTruthy();
                });
                it('method "suspendDataBind" works in "' + context + '"', function () {
                    expect(typeof scope.suspendDataBind === 'function').toBeTruthy();
                    expect(function () {
                        scope.suspendDataBind();
                    }).not.toThrow();
                });
                it('method "unbindFromData" works in "' + context + '"', function () {
                    expect(typeof scope.unbindFromData === 'function').toBeTruthy();
                    expect(function () {
                        scope.unbindFromData();
                    }).not.toThrow();
                });
            });
        });

        describe('dataBindVal', function () {
            it('returns "undefined" for unbinded param', function () {
                expect(BEM.dataBindVal('foo')).toBeUndefined();
            });
            it('throws if set value for "undefined" binding', function () {
                expect(function () {
                    BEM.dataBindVal('foo', 'bar');
                }).toThrow();
            });
            it('returns correct value', function () {
                var value = randomValue();
                block1 = staticBlock({
                    dataBindings: {
                        'test': { initAccessor: 'prop' }
                    },
                    prop: randomValue()
                });
                expect(BEM.dataBindVal('test')).toBe(block1.prop);
                BEM.dataBindVal('test', value);
                expect(value).toBe(BEM.dataBindVal('test'));
            });
        });

        describe('suspendDataBind', function () {
            block2 = staticBlock({
                dataBindings: {'test': { initAccessor: 'prop', accessor: 'prop' }}
            });
            it('suspends data change', function () {
                var lastValue;
                expect(block2.prop).toBeDefined();
                lastValue = BEM.dataBindVal('test');
                expect(block2.prop).toBe(lastValue);
                block2.suspendDataBind();
                BEM.dataBindVal('test', randomValue());
                expect(block2.prop).toBe(lastValue);
                expect(block2.prop).not.toBe(BEM.dataBindVal('test'));
            });
            it('resumes data change', function () {
                BEM.dataBindVal('test', randomValue());
                expect(block2.prop).not.toBe(BEM.dataBindVal('test'));
                block2.suspendDataBind(false);
                BEM.dataBindVal('test', randomValue());
                expect(block2.prop).toBe(BEM.dataBindVal('test'));
            });
        });

        describe('unbindFromData', function () {
            it('removes binding when last binder unbinds', function () {
                expect(BEM.dataBindVal('test')).toBeDefined();
                expect(block1).toBeDefined();
                block1.unbindFromData();
                expect(BEM.dataBindVal('test')).toBeDefined();
                block2.unbindFromData();
                expect(BEM.dataBindVal('test')).toBeUndefined();
            });
        });
    });

    describe('initAccessor', function () {
        var param_1_1_value = randomValue(),
            param_1_1_value_2 = randomValue(),
            param_1_1_value_3 = randomValue(),
            param_1_1_name, param_1_1_in,
            param_1_1_name_2, param_1_1_in_2,
            block1, block2, block3, block4;

        describe('setup new value', function () {
            it('from context property', function () {
                block1 = staticBlock({
                    dataBindings: {'param-1-1': { initAccessor: 'initValue' }},
                    initValue: param_1_1_value
                });
                expect(BEM.dataBindVal('param-1-1')).toBe(param_1_1_value);
            });

            it('from context method', function () {
                block2 = staticBlock({
                    dataBindings: {'param-1-1': { initAccessor: 'initValue' }},
                    initValue: function (value, name) {
                        param_1_1_name = name;
                        param_1_1_in = value;
                        return param_1_1_value_2;
                    }
                });
                expect(BEM.dataBindVal('param-1-1')).toBe(param_1_1_value_2);
            });

            it('from function', function () {
                block3 = staticBlock({
                    dataBindings: {
                        'param-1-1': { initAccessor: function (value, name) {
                            param_1_1_name_2 = name;
                            param_1_1_in_2 = value;
                            return param_1_1_value_3;
                        } }
                    }
                });
                expect(BEM.dataBindVal('param-1-1')).toBe(param_1_1_value_3);
            });

            it('to context property', function () {
                block4 = staticBlock({
                    dataBindings: {'param-1-1': { initAccessor: 'initValue' }}
                });
                expect(block4.initValue).toBe(param_1_1_value_3);
                expect(block4.initValue).toBe(BEM.dataBindVal('param-1-1'));
            });
        });

        it('functions reseive correct params', function () {
            expect(param_1_1_name).toBe('param-1-1');
            expect(param_1_1_name_2).toBe('param-1-1');
            expect(param_1_1_in).toBe(param_1_1_value);
            expect(param_1_1_in_2).toBe(param_1_1_value_2);

            block1.unbindFromData();
            block2.unbindFromData();
            block3.unbindFromData();
            block4.unbindFromData();
        });
    });

    describe('synchronize primitive values', function () {
        var decl1 = staticBlock(getProps()),
            decl2, decl3, block1, block2;

        function getProps() {
            return {
                dataBindings: {
                    'param-2-1': {
                        initAccessor: 'val',
                        event: 'update',
                        accessor: 'val'
                    },
                    'param-2-2': {
                        initAccessor: 'val',
                        event: 'update',
                        accessor: 'val'
                    }
                },
                _values: {
                    'param-2-1': Math.random(),
                    'param-2-2': randomValue()
                },
                val: function (value, name) {
                    if (value === undefined || value === null) {
                        return this._values[name];
                    }
                    this._values[name] = value;
                }
            };
        }

        function getDynamicProps() {
            var props = getProps();
            delete props._values;
            props.onSetMod = {js: function () {
                this._values = {
                    'param-2-1': {name: 'initial value for "param-2-1"', value: randomValue()},
                    'param-2-2': {name: 'startup value for "param-2-2"', value: randomValue()}
                };
            }};
            return props;
        }

        it('between new block and dataBindVal', function () {
            expect(decl1.dataBindVal('param-2-1')).toEqual(decl1.val(undefined, 'param-2-1'));
            expect(decl1.dataBindVal('param-2-2')).toEqual(decl1.val(undefined, 'param-2-2'));
            expect(decl1.dataBindVal('param-2-2')).not.toEqual(decl1.dataBindVal('param-2-1'));
        });

        it('between blocks', function () {
            decl2 = staticBlock(getProps());
            expect(decl2.val(undefined, 'param-2-1')).toEqual(decl1.val(undefined, 'param-2-1'));
            expect(decl2.val(undefined, 'param-2-2')).toEqual(decl1.val(undefined, 'param-2-2'));

            decl2.val(Math.random(), 'param-2-1');
            decl2.val(randomValue(), 'param-2-2');
            expect(decl2.val(undefined, 'param-2-1')).not.toEqual(decl1.val(undefined, 'param-2-1'));
            expect(decl2.val(undefined, 'param-2-2')).not.toEqual(decl1.val(undefined, 'param-2-2'));

            decl2.trigger('update');
            expect(decl2.val(undefined, 'param-2-1')).toEqual(decl1.val(undefined, 'param-2-1'));
            expect(decl2.val(undefined, 'param-2-2')).toEqual(decl1.val(undefined, 'param-2-2'));
            expect(decl1.dataBindVal('param-2-1')).toEqual(decl1.val(undefined, 'param-2-1'));
            expect(decl1.dataBindVal('param-2-2')).toEqual(decl1.val(undefined, 'param-2-2'));
            expect(decl1.dataBindVal('param-2-2')).not.toEqual(decl1.dataBindVal('param-2-1'));
        });

        it('between params of static and dynamic blocks', function () {
            decl3 = dynamicBlock(getDynamicProps());
            block1 = jQuery('<b/>').bem(decl3.getName());

            expect(block1.val(undefined, 'param-2-1')).toEqual(decl1.val(undefined, 'param-2-1'));
            expect(block1.val(undefined, 'param-2-2')).toEqual(decl1.val(undefined, 'param-2-2'));

            block1.val(Math.random(), 'param-2-1');
            block1.val(randomValue(), 'param-2-2');
            expect(block1.val(undefined, 'param-2-1')).not.toEqual(decl1.val(undefined, 'param-2-1'));
            expect(block1.val(undefined, 'param-2-2')).not.toEqual(decl1.val(undefined, 'param-2-2'));

            block1.trigger('update');
            expect(block1.val(undefined, 'param-2-1')).toEqual(decl1.val(undefined, 'param-2-1'));
            expect(block1.val(undefined, 'param-2-2')).toEqual(decl1.val(undefined, 'param-2-2'));
        });

        it('between params of dynamic blocks', function () {
            block2 = jQuery('<b/>').bem(decl3.getName());
            expect(block2.val(undefined, 'param-2-1')).toEqual(block1.val(undefined, 'param-2-1'));
            expect(block2.val(undefined, 'param-2-2')).toEqual(block1.val(undefined, 'param-2-2'));

            block2.val(Math.random(), 'param-2-1');
            block2.val(randomValue(), 'param-2-2');
            expect(block2.val(undefined, 'param-2-1')).not.toEqual(block1.val(undefined, 'param-2-1'));
            expect(block2.val(undefined, 'param-2-2')).not.toEqual(block1.val(undefined, 'param-2-2'));

            block2.trigger('update');
            expect(block2.val(undefined, 'param-2-1')).toEqual(block1.val(undefined, 'param-2-1'));
            expect(block2.val(undefined, 'param-2-2')).toEqual(block1.val(undefined, 'param-2-2'));

            decl1.unbindFromData();
            decl2.unbindFromData();
            block1.unbindFromData();
            block2.unbindFromData();
        });
    });

    describe('synchronize object values', function () {
        var decl1 = staticBlock(getProps()),
            decl2, decl3, block1, block2;

        function getProps() {
            return {
                dataBindings: {
                    'param-3-1': {
                        initAccessor: 'val',
                        event: 'update',
                        accessor: 'val'
                    },
                    'param-3-2': {
                        initAccessor: 'val',
                        event: 'update',
                        accessor: 'val'
                    }
                },
                _values: {
                    'param-3-1': {name: 'initial value for "param-3-1"', value: randomValue()},
                    'param-3-2': {name: 'startup value for "param-3-2"', value: randomValue()}
                },
                val: function (value, name) {
                    if (value === undefined || value === null) {
                        return this._values[name];
                    }
                    this._values[name] = value;
                }
            };
        }

        function getDynamicProps() {
            var props = getProps();
            delete props._values;
            props.onSetMod = {js: function () {
                this._values = {
                    'param-3-1': {name: 'initial value for "param-3-1"', value: randomValue()},
                    'param-3-2': {name: 'startup value for "param-3-2"', value: randomValue()}
                };
            }};
            return props;
        }

        it('between new block and dataBindVal', function () {
            expect(decl1.dataBindVal('param-3-1')).toEqual(decl1.val(undefined, 'param-3-1'));
            expect(decl1.dataBindVal('param-3-2')).toEqual(decl1.val(undefined, 'param-3-2'));
            expect(decl1.dataBindVal('param-3-2')).not.toEqual(decl1.dataBindVal('param-3-1'));
        });

        it('between blocks', function () {
            decl2 = staticBlock(getProps());
            expect(decl2.val(undefined, 'param-3-1')).toEqual(decl1.val(undefined, 'param-3-1'));
            expect(decl2.val(undefined, 'param-3-2')).toEqual(decl1.val(undefined, 'param-3-2'));

            decl2.val({name: '[S] edited "param-3-1"', value: randomValue()}, 'param-3-1');
            decl2.val({name: '[S] edited "param-3-2"', value: randomValue()}, 'param-3-2');
            expect(decl2.val(undefined, 'param-3-1')).not.toEqual(decl1.val(undefined, 'param-3-1'));
            expect(decl2.val(undefined, 'param-3-2')).not.toEqual(decl1.val(undefined, 'param-3-2'));

            decl2.trigger('update');
            expect(decl2.val(undefined, 'param-3-1')).toEqual(decl1.val(undefined, 'param-3-1'));
            expect(decl2.val(undefined, 'param-3-2')).toEqual(decl1.val(undefined, 'param-3-2'));
            expect(decl1.dataBindVal('param-3-1')).toEqual(decl1.val(undefined, 'param-3-1'));
            expect(decl1.dataBindVal('param-3-2')).toEqual(decl1.val(undefined, 'param-3-2'));
            expect(decl1.dataBindVal('param-3-2')).not.toEqual(decl1.dataBindVal('param-3-1'));
        });

        it('between params of static and dynamic blocks', function () {
            decl3 = dynamicBlock(getDynamicProps());
            block1 = jQuery('<b/>').bem(decl3.getName());

            expect(block1.val(undefined, 'param-3-1')).toEqual(decl1.val(undefined, 'param-3-1'));
            expect(block1.val(undefined, 'param-3-2')).toEqual(decl1.val(undefined, 'param-3-2'));

            block1.val({name: '[D] edited "param-3-1"', value: randomValue()}, 'param-3-1');
            block1.val({name: '[D] edited "param-3-2"', value: randomValue()}, 'param-3-2');
            expect(block1.val(undefined, 'param-3-1')).not.toEqual(decl1.val(undefined, 'param-3-1'));
            expect(block1.val(undefined, 'param-3-2')).not.toEqual(decl1.val(undefined, 'param-3-2'));

            block1.trigger('update');
            expect(block1.val(undefined, 'param-3-1')).toEqual(decl1.val(undefined, 'param-3-1'));
            expect(block1.val(undefined, 'param-3-2')).toEqual(decl1.val(undefined, 'param-3-2'));
        });

        it('between params of dynamic blocks', function () {
            block2 = jQuery('<b/>').bem(decl3.getName());
            expect(block2.val(undefined, 'param-3-1')).toEqual(block1.val(undefined, 'param-3-1'));
            expect(block2.val(undefined, 'param-3-2')).toEqual(block1.val(undefined, 'param-3-2'));

            block2.val({name: '[D] edited "param-3-1"', value: randomValue()}, 'param-3-1');
            block2.val({name: '[D] edited "param-3-2"', value: randomValue()}, 'param-3-2');
            expect(block2.val(undefined, 'param-3-1')).not.toEqual(block1.val(undefined, 'param-3-1'));
            expect(block2.val(undefined, 'param-3-2')).not.toEqual(block1.val(undefined, 'param-3-2'));

            block2.trigger('update');
            expect(block2.val(undefined, 'param-3-1')).toEqual(block1.val(undefined, 'param-3-1'));
            expect(block2.val(undefined, 'param-3-2')).toEqual(block1.val(undefined, 'param-3-2'));

            decl1.unbindFromData();
            decl2.unbindFromData();
            block1.unbindFromData();
            block2.unbindFromData();
        });
    });

});
