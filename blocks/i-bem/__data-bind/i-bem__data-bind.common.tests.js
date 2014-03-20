describe('BEM data bindings', function () {

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
        return BEM.decl('i-test-' + blockIdx++, null, props);
    }

    function dynamicBlock(props) {
        return BEM.decl('i-test-' + blockIdx++, props);
    }


    describe('data binding method', function () {
        var block1, block2;

        describe('should be defined', function () {
            BEM.decl('i-test', {foo: 'bar'}, {baz: 'foo'});

            ['BEM', 'BEM.blocks[\'i-test\']', 'BEM.create(\'i-test\')'].forEach(function (context) {
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
            param_1dot1_path, param_1dot1_name,
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

            it('from context property by path', function () {
                var value = randomValue(),
                    block1 = staticBlock({
                        dataBindings: {'binding-param': { initAccessor: 'path.to.param' }},
                        path: {to: {param: value}}
                    });
                expect(block1.path.to.param).toBe(value);
                expect(BEM.dataBindVal('binding-param')).toBe(value);
                block1.unbindFromData();
            });

            it('to context property by path', function () {
                var value = randomValue(),
                    block2 = staticBlock({
                        dataBindings: {'param-1-1': { initAccessor: 'path.to.param' }}
                    });
                expect(block2.path.to.param).toBe(BEM.dataBindVal('param-1-1'));
            });
        });

        it('functions reseive correct params', function () {
            var block5 = staticBlock({
                dataBindings: {'param-1.1': { initAccessor: 'initValue' }},
                initValue: function (value, name, path) {
                    param_1dot1_path = path;
                    param_1dot1_name = name;
                }
            });
            expect(param_1dot1_path).toBe('param-1.1');
            expect(param_1dot1_name).toBe('1');
            expect(param_1_1_name).toBe('param-1-1');
            expect(param_1_1_name_2).toBe('param-1-1');
            expect(param_1_1_in).toBe(param_1_1_value);
            expect(param_1_1_in_2).toBe(param_1_1_value_2);

            block1.unbindFromData();
            block2.unbindFromData();
            block3.unbindFromData();
            block4.unbindFromData();
            block5.unbindFromData();
        });
    });

    describe('synchronize primitive values', function () {
        var decl1, decl2, Decl3, block1, block2;

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
        decl1 = staticBlock(getProps());

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
            Decl3 = dynamicBlock(getDynamicProps());
            block1 = new Decl3();

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
            block2 = new Decl3();
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
        var decl1, decl2, Decl3, block1, block2;

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
        decl1 = staticBlock(getProps());

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
            Decl3 = dynamicBlock(getDynamicProps());
            block1 = new Decl3();

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
            block2 = new Decl3();
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

    describe('name-spaces', function () {
        var block1 = staticBlock({
                dataBindings: {
                    'ns.subNs.property1': {
                        accessor: 'val1',
                        initAccessor: 'val1',
                        event: 'change'
                    },
                    'ns.subNs.property2': {
                        accessor: 'val2',
                        initAccessor: 'val2',
                        event: 'change'
                    }
                },
                val1: randomValue(),
                val2: randomValue(),
                update: function (values) {
                    this.val1 = values.val1;
                    this.val2 = values.val2;
                    this.trigger('change');
                }
            });

        it('return correct value from dataBindVal', function () {
            var values = BEM.dataBindVal('ns');
            expect(block1.val1).toBe(values.subNs.property1);
            expect(block1.val2).toBe(values.subNs.property2);
            values = BEM.dataBindVal('ns.subNs');
            expect(block1.val1).toBe(values.property1);
            expect(block1.val2).toBe(values.property2);
        });

        it('change value through dataBindVal', function () {
            var newValue1 = randomValue(),
                newValue2 = randomValue(),
                values;

            BEM.dataBindVal('ns', {
                subNs: {
                    property1: newValue1,
                    property2: newValue2
                }
            });

            values = BEM.dataBindVal('ns');
            expect(newValue1).toBe(values.subNs.property1);
            expect(newValue2).toBe(values.subNs.property2);
            values = BEM.dataBindVal('ns.subNs');
            expect(newValue1).toBe(values.property1);
            expect(newValue2).toBe(values.property2);
            expect(BEM.dataBindVal('ns.subNs.property1')).toBe(newValue1);
            expect(BEM.dataBindVal('ns.subNs.property2')).toBe(newValue2);
            expect(newValue1).toBe(block1.val1);
            expect(newValue2).toBe(block1.val2);
        });

        it('call accessors with correct params', function () {
            var block2 = staticBlock({
                    dataBindings: {'ns.subNs.testProp': 'val'},
                    val: function (value, prop, path) {
                        called = true;
                        argValue = value;
                        argProp = prop;
                        argPath = path;
                    }
                }),
                value = randomValue(),
                argValue, argProp, argPath, called;

            BEM.dataBindVal('ns.subNs.testProp', value);
            expect(argValue).toBe(value);
            expect(argProp).toBe('testProp');
            expect(argPath).toBe('ns.subNs.testProp');

            block2.unbindFromData();
        });

        it('trigger data change events', function () {
            var block2, block3, values, ready;

            /*global runs*/
            runs(function () {
                block2 = staticBlock({
                    dataBindings: {ns: 'nsValue'}
                });
                block3 = staticBlock({
                    dataBindings: {'ns.subNs': 'nsValue'}
                });
                values = {
                    val1: randomValue(),
                    val2: randomValue()
                };

                block1.update(values);
                setTimeout(function () {
                    ready = 1;
                }, 200);
            });

            /*global waitsFor*/
            waitsFor(function () {
                return ready;
            }, 'properties should be changed', 400);

            /*global runs*/
            runs(function () {
                expect(BEM.dataBindVal('ns.subNs.property1')).toBe(values.val1);
                expect(BEM.dataBindVal('ns.subNs.property2')).toBe(values.val2);
                expect(block2.nsValue).toBeDefined();
                expect(block2.nsValue).toEqual(BEM.dataBindVal('ns'));
                expect(block3.nsValue).toBeDefined();
                expect(block3.nsValue).toEqual(BEM.dataBindVal('ns.subNs'));

                block2.unbindFromData();
                block3.unbindFromData();
            });
        });

        it('destruct successfully', function () {
            var block2 = staticBlock({
                    dataBindings: {ns: 'nsValue'}
                }),
                block3 = staticBlock({
                    dataBindings: {'ns.subNs': 'nsValue'}
                });

            block2.unbindFromData('ns');
            block3.unbindFromData('ns.subNs');
            block1.unbindFromData();
            expect(BEM.dataBindVal('ns.subNs.property1')).toBeUndefined();
            expect(BEM.dataBindVal('ns.subNs.property2')).toBeUndefined();
            expect(BEM.dataBindVal('ns.subNs')).toBeUndefined();
            expect(BEM.dataBindVal('ns')).toBeUndefined();
        });
    });

});
