describe('i-bem__data-bind', function () {

    var text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'.split(/,\s|\.\s|\s/),
        txtLen = text.length,
        blockIdx = 0,
        rndIdx = 1;

    function randomValue() {
        return [
            text[Math.round(Math.random() * txtLen)],
            text[Math.round(Math.random() * txtLen)],
            text[Math.round(Math.random() * txtLen)],
            '(' + rndIdx++ + ')'
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
                    expect(typeof scope.bindToData === 'function').to.equal(true);
                    expect(function () {
                        scope.bindToData('p1', {initAccessor: 'initVal'});
                    }).not.throw();
                    expect(function () {
                        scope.bindToData({
                            p2: {get: '_getAccessor', set: '_setAccessor'},
                            p3: {accessor: '_accessor', event: 'nonexistingevent'}
                        });
                    }).not.throw();
                });
                it('method "dataBindVal" works in "' + context + '"', function () {
                    expect(typeof scope.dataBindVal === 'function').to.equal(true);
                });
                it('method "suspendDataBind" works in "' + context + '"', function () {
                    expect(typeof scope.suspendDataBind === 'function').to.equal(true);
                    expect(function () {
                        scope.suspendDataBind();
                    }).not.throw();
                });
                it('method "unbindFromData" works in "' + context + '"', function () {
                    expect(typeof scope.unbindFromData === 'function').to.equal(true);
                    expect(function () {
                        scope.unbindFromData();
                    }).not.throw();
                });
            });
        });

        describe('dataBindVal', function () {
            it('returns "undefined" for unbinded param', function () {
                expect(BEM.dataBindVal('foo')).to.equal(undefined);
            });
            it('throws if set value for "undefined" binding', function () {
                expect(function () {
                    BEM.dataBindVal('foo', 'bar');
                }).to.throw();
            });
            it('returns correct value', function () {
                var value = randomValue();
                block1 = staticBlock({
                    dataBindings: {
                        'test': { initAccessor: 'prop' }
                    },
                    prop: randomValue()
                });
                expect(BEM.dataBindVal('test')).to.equal(block1.prop);
                BEM.dataBindVal('test', value);
                expect(value).to.equal(BEM.dataBindVal('test'));
            });
            it('extend namespaces', function () {
                var val1 = randomValue(),
                    val2 = randomValue(),
                    val3 = randomValue(),
                    value = {value1: randomValue()},
                    block = staticBlock({
                        dataBindings: {
                            'ns0.value1': { initAccessor: 'prop1', accessor: 'prop2' },
                            'ns0.value2': { initAccessor: 'prop2', accessor: 'prop2' },
                            'ns0.value3': { initAccessor: 'prop3', accessor: 'prop3' }
                        },
                        prop1: val1,
                        prop2: val2,
                        prop3: val3
                    });
                BEM.dataBindVal('ns0', value, true);
                expect(BEM.dataBindVal('ns0')).to.eql({
                    value1: value.value1,
                    value2: val2,
                    value3: val3
                });
                block.unbindFromData();
            });
        });

        describe('suspendDataBind', function () {
            block2 = staticBlock({
                dataBindings: {'test': { initAccessor: 'prop', accessor: 'prop' }}
            });
            it('suspends data change', function () {
                var lastValue;
                expect(block2.prop).to.not.equal(undefined);
                lastValue = BEM.dataBindVal('test');
                expect(block2.prop).to.equal(lastValue);
                block2.suspendDataBind();
                BEM.dataBindVal('test', randomValue());
                expect(block2.prop).to.equal(lastValue);
                expect(block2.prop).to.not.equal(BEM.dataBindVal('test'));
            });
            it('resumes data change', function () {
                BEM.dataBindVal('test', randomValue());
                expect(block2.prop).to.not.equal(BEM.dataBindVal('test'));
                block2.suspendDataBind(false);
                BEM.dataBindVal('test', randomValue());
                expect(block2.prop).to.equal(BEM.dataBindVal('test'));
            });
        });

        describe('unbindFromData', function () {
            it('removes binding when last binder unbinds', function () {
                expect(BEM.dataBindVal('test')).to.not.equal(undefined);
                expect(block1).to.not.equal(undefined);
                block1.unbindFromData();
                expect(BEM.dataBindVal('test')).to.not.equal(undefined);
                block2.unbindFromData();
                expect(BEM.dataBindVal('test')).to.equal(undefined);
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
                expect(BEM.dataBindVal('param-1-1')).to.equal(param_1_1_value);
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
                expect(BEM.dataBindVal('param-1-1')).to.equal(param_1_1_value_2);
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
                expect(BEM.dataBindVal('param-1-1')).to.equal(param_1_1_value_3);
            });

            it('to context property', function () {
                block4 = staticBlock({
                    dataBindings: {'param-1-1': { initAccessor: 'initValue' }}
                });
                expect(block4.initValue).to.equal(param_1_1_value_3);
                expect(block4.initValue).to.equal(BEM.dataBindVal('param-1-1'));
            });

            it('from context property by path', function () {
                var value = randomValue(),
                    block1 = staticBlock({
                        dataBindings: {'binding-param': { initAccessor: 'path.to.param' }},
                        path: {to: {param: value}}
                    });
                expect(block1.path.to.param).to.equal(value);
                expect(BEM.dataBindVal('binding-param')).to.equal(value);
                block1.unbindFromData();
            });

            it('to context property by path', function () {
                var block2 = staticBlock({
                        dataBindings: {'param-1-1': { initAccessor: 'path.to.param' }}
                    });
                expect(block2.path.to.param).to.equal(BEM.dataBindVal('param-1-1'));
            });

            it('functions reseive correct params', function () {
                var block5 = staticBlock({
                    dataBindings: {'param-1.1': { initAccessor: 'initValue' }},
                    initValue: function (value, name, path) {
                        param_1dot1_path = path;
                        param_1dot1_name = name;
                    }
                });
                expect(param_1dot1_path).to.equal('param-1.1', 'correct namespace path param');
                expect(param_1dot1_name).to.equal('1', 'correct namespace param name');
                expect(param_1_1_name).to.equal('param-1-1', 'correct param name');
                expect(param_1_1_name_2).to.equal('param-1-1');
                expect(param_1_1_in).to.equal(param_1_1_value);
                expect(param_1_1_in_2).to.equal(param_1_1_value_2);

                block1.unbindFromData();
                block2.unbindFromData();
                block3.unbindFromData();
                block4.unbindFromData();
                block5.unbindFromData();
            });
        });
    });

    describe('use value from triggered event', function () {
        var initValue = randomValue(),
            Decl = BEM.decl('trigger-block', {
                dataBindings: {
                    'trigger': {
                        initAccessor: '_val',
                        event: 'change'
                    }
                },
                _val: initValue,
                val: function (value) {
                    if (value === undefined) {
                        return this._val;
                    }
                    this._val = value;
                    this.trigger('change', value);
                }
            });

        it('match new value', function () {
            var block = new Decl();

            expect(block.val()).to.equal(initValue);
            expect(BEM.dataBindVal('trigger')).to.equal(initValue);
            block.val(randomValue());
            expect(block.val()).to.equal(BEM.dataBindVal('trigger'));
            expect(block.val()).to.not.equal(initValue);
            block.destruct();
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
            expect(decl1.dataBindVal('param-2-1')).to.eql(decl1.val(undefined, 'param-2-1'));
            expect(decl1.dataBindVal('param-2-2')).to.eql(decl1.val(undefined, 'param-2-2'));
            expect(decl1.dataBindVal('param-2-2')).to.not.eql(decl1.dataBindVal('param-2-1'));
        });

        it('between blocks', function () {
            decl2 = staticBlock(getProps());
            expect(decl2.val(undefined, 'param-2-1')).to.eql(decl1.val(undefined, 'param-2-1'));
            expect(decl2.val(undefined, 'param-2-2')).to.eql(decl1.val(undefined, 'param-2-2'));

            decl2.val(Math.random(), 'param-2-1');
            decl2.val(randomValue(), 'param-2-2');
            expect(decl2.val(undefined, 'param-2-1')).to.not.eql(decl1.val(undefined, 'param-2-1'));
            expect(decl2.val(undefined, 'param-2-2')).to.not.eql(decl1.val(undefined, 'param-2-2'));

            decl2.trigger('update');
            expect(decl2.val(undefined, 'param-2-1')).to.eql(decl1.val(undefined, 'param-2-1'));
            expect(decl2.val(undefined, 'param-2-2')).to.eql(decl1.val(undefined, 'param-2-2'));
            expect(decl1.dataBindVal('param-2-1')).to.eql(decl1.val(undefined, 'param-2-1'));
            expect(decl1.dataBindVal('param-2-2')).to.eql(decl1.val(undefined, 'param-2-2'));
            expect(decl1.dataBindVal('param-2-2')).to.not.eql(decl1.dataBindVal('param-2-1'));
        });

        it('between params of static and dynamic blocks', function () {
            Decl3 = dynamicBlock(getDynamicProps());
            block1 = new Decl3();

            expect(block1.val(undefined, 'param-2-1')).to.eql(decl1.val(undefined, 'param-2-1'));
            expect(block1.val(undefined, 'param-2-2')).to.eql(decl1.val(undefined, 'param-2-2'));

            block1.val(Math.random(), 'param-2-1');
            block1.val(randomValue(), 'param-2-2');
            expect(block1.val(undefined, 'param-2-1')).to.not.eql(decl1.val(undefined, 'param-2-1'));
            expect(block1.val(undefined, 'param-2-2')).to.not.eql(decl1.val(undefined, 'param-2-2'));

            block1.trigger('update');
            expect(block1.val(undefined, 'param-2-1')).to.eql(decl1.val(undefined, 'param-2-1'));
            expect(block1.val(undefined, 'param-2-2')).to.eql(decl1.val(undefined, 'param-2-2'));
        });

        it('between params of dynamic blocks', function () {
            block2 = new Decl3();
            expect(block2.val(undefined, 'param-2-1')).to.eql(block1.val(undefined, 'param-2-1'));
            expect(block2.val(undefined, 'param-2-2')).to.eql(block1.val(undefined, 'param-2-2'));

            block2.val(Math.random(), 'param-2-1');
            block2.val(randomValue(), 'param-2-2');
            expect(block2.val(undefined, 'param-2-1')).to.not.eql(block1.val(undefined, 'param-2-1'));
            expect(block2.val(undefined, 'param-2-2')).to.not.eql(block1.val(undefined, 'param-2-2'));

            block2.trigger('update');
            expect(block2.val(undefined, 'param-2-1')).to.eql(block1.val(undefined, 'param-2-1'));
            expect(block2.val(undefined, 'param-2-2')).to.eql(block1.val(undefined, 'param-2-2'));

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
            expect(decl1.dataBindVal('param-3-1')).to.eql(decl1.val(undefined, 'param-3-1'));
            expect(decl1.dataBindVal('param-3-2')).to.eql(decl1.val(undefined, 'param-3-2'));
            expect(decl1.dataBindVal('param-3-2')).to.not.eql(decl1.dataBindVal('param-3-1'));
        });

        it('between blocks', function () {
            decl2 = staticBlock(getProps());
            expect(decl2.val(undefined, 'param-3-1')).to.eql(decl1.val(undefined, 'param-3-1'));
            expect(decl2.val(undefined, 'param-3-2')).to.eql(decl1.val(undefined, 'param-3-2'));

            decl2.val({name: '[S] edited "param-3-1"', value: randomValue()}, 'param-3-1');
            decl2.val({name: '[S] edited "param-3-2"', value: randomValue()}, 'param-3-2');
            expect(decl2.val(undefined, 'param-3-1')).to.not.eql(decl1.val(undefined, 'param-3-1'));
            expect(decl2.val(undefined, 'param-3-2')).to.not.eql(decl1.val(undefined, 'param-3-2'));

            decl2.trigger('update');
            expect(decl2.val(undefined, 'param-3-1')).to.eql(decl1.val(undefined, 'param-3-1'));
            expect(decl2.val(undefined, 'param-3-2')).to.eql(decl1.val(undefined, 'param-3-2'));
            expect(decl1.dataBindVal('param-3-1')).to.eql(decl1.val(undefined, 'param-3-1'));
            expect(decl1.dataBindVal('param-3-2')).to.eql(decl1.val(undefined, 'param-3-2'));
            expect(decl1.dataBindVal('param-3-2')).to.not.eql(decl1.dataBindVal('param-3-1'));
        });

        it('between params of static and dynamic blocks', function () {
            Decl3 = dynamicBlock(getDynamicProps());
            block1 = new Decl3();

            expect(block1.val(undefined, 'param-3-1')).to.eql(decl1.val(undefined, 'param-3-1'));
            expect(block1.val(undefined, 'param-3-2')).to.eql(decl1.val(undefined, 'param-3-2'));

            block1.val({name: '[D] edited "param-3-1"', value: randomValue()}, 'param-3-1');
            block1.val({name: '[D] edited "param-3-2"', value: randomValue()}, 'param-3-2');
            expect(block1.val(undefined, 'param-3-1')).to.not.eql(decl1.val(undefined, 'param-3-1'));
            expect(block1.val(undefined, 'param-3-2')).to.not.eql(decl1.val(undefined, 'param-3-2'));

            block1.trigger('update');
            expect(block1.val(undefined, 'param-3-1')).to.eql(decl1.val(undefined, 'param-3-1'));
            expect(block1.val(undefined, 'param-3-2')).to.eql(decl1.val(undefined, 'param-3-2'));
        });

        it('between params of dynamic blocks', function () {
            block2 = new Decl3();
            expect(block2.val(undefined, 'param-3-1')).to.eql(block1.val(undefined, 'param-3-1'));
            expect(block2.val(undefined, 'param-3-2')).to.eql(block1.val(undefined, 'param-3-2'));

            block2.val({name: '[D] edited "param-3-1"', value: randomValue()}, 'param-3-1');
            block2.val({name: '[D] edited "param-3-2"', value: randomValue()}, 'param-3-2');
            expect(block2.val(undefined, 'param-3-1')).to.not.eql(block1.val(undefined, 'param-3-1'));
            expect(block2.val(undefined, 'param-3-2')).to.not.eql(block1.val(undefined, 'param-3-2'));

            block2.trigger('update');
            expect(block2.val(undefined, 'param-3-1')).to.eql(block1.val(undefined, 'param-3-1'));
            expect(block2.val(undefined, 'param-3-2')).to.eql(block1.val(undefined, 'param-3-2'));

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
            expect(block1.val1).to.equal(values.subNs.property1);
            expect(block1.val2).to.equal(values.subNs.property2);
            values = BEM.dataBindVal('ns.subNs');
            expect(block1.val1).to.equal(values.property1);
            expect(block1.val2).to.equal(values.property2);
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
            expect(newValue1).to.equal(values.subNs.property1);
            expect(newValue2).to.equal(values.subNs.property2);
            values = BEM.dataBindVal('ns.subNs');
            expect(newValue1).to.equal(values.property1);
            expect(newValue2).to.equal(values.property2);
            expect(BEM.dataBindVal('ns.subNs.property1')).to.equal(newValue1);
            expect(BEM.dataBindVal('ns.subNs.property2')).to.equal(newValue2);
            expect(newValue1).to.equal(block1.val1);
            expect(newValue2).to.equal(block1.val2);
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
            expect(argValue).to.equal(value);
            expect(argProp).to.equal('testProp');
            expect(argPath).to.equal('ns.subNs.testProp');

            block2.unbindFromData();
        });

        it('trigger data change events', function () {
            var block2, block3, values, promise;

            promise = Vow.promise(function () {
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
                    promise.fulfill();
                }, 200);
            })
            .then(function () {
                expect(BEM.dataBindVal('ns.subNs.property1')).to.equal(values.val1);
                expect(BEM.dataBindVal('ns.subNs.property2')).to.equal(values.val2);
                expect(block2.nsValue).to.not.equal(undefined);
                expect(block2.nsValue).to.eql(BEM.dataBindVal('ns'));
                expect(block3.nsValue).to.not.equal(undefined);
                expect(block3.nsValue).to.eql(BEM.dataBindVal('ns.subNs'));

                block2.unbindFromData();
                block3.unbindFromData();
            })
            .done();
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
            expect(BEM.dataBindVal('ns.subNs.property1')).to.equal(undefined);
            expect(BEM.dataBindVal('ns.subNs.property2')).to.equal(undefined);
            expect(BEM.dataBindVal('ns.subNs')).to.equal(undefined);
            expect(BEM.dataBindVal('ns')).to.equal(undefined);
        });

        it('correct converts to', function () {
            var value = {
                    part1: {
                        part11: {
                            value1: randomValue()
                        }
                    },
                    part2: {
                        part21: {
                            part211: {
                                value2: randomValue(),
                                value3: randomValue(),
                                value4: randomValue()
                            },
                            value5: randomValue()
                        },
                        value6: randomValue()
                    },
                    value7: randomValue()
                },
                Decl1 = BEM.decl('i-test-' + blockIdx++, {
                    dataBindings: {
                        'ns2': {
                            initAccessor: 'val',
                            set: 'val'
                        }
                    },
                    val: value
                }),
                Decl2 = BEM.decl('i-test-' + blockIdx++, {
                    dataBindings: {
                        'ns2.part1': {
                            initAccessor: 'val',
                            event: 'change',
                            get: 'val'
                        }
                    },
                    val: function (value) {
                        if (value === undefined) {
                            return this._val;
                        }
                        this._val = value;
                        this.trigger('change');
                    }
                }),
                Decl3 =  BEM.decl('i-test-' + blockIdx++, {
                    dataBindings: {
                        'ns2.part2.part21.part211.value2': {
                            initAccessor: '_val.value2',
                            event: 'change',
                            get: 'val'
                        },
                        'ns2.part2.part21.part211.value3': {
                            initAccessor: '_val.value3',
                            event: 'change',
                            get: 'val'
                        }
                    },
                    _val: {},
                    val: function (value, name) {
                        if (value === undefined) {
                            return name ? this._val[name] : this._val;
                        }

                        if (name) {
                            this._val[name] = value;
                        } else {
                            this._val = value;
                        }
                        this.trigger('change');
                    }
                }),
                block1 = new Decl1(),
                block2 = new Decl2(),
                block3, promise;

            expect(BEM.dataBindVal('ns2')).to.eql(value);
            expect(BEM.dataBindVal('ns2')).to.eql(block1.val);
            expect(BEM.dataBindVal('ns2.part1')).to.eql(value.part1);
            expect(BEM.dataBindVal('ns2.part1')).to.eql(block2.val());
            promise = Vow.promise(function () {
                block2.val({part11: {value1: randomValue()}});
                setTimeout(function () {
                    promise.fulfill();
                }, 200);
            })
            .then(function () {
                expect(BEM.dataBindVal('ns2.part1')).to.eql(block2.val());
                expect(BEM.dataBindVal('ns2')).to.not.eql(value);
                expect(block1.val.part1).to.eql(block2.val());

                block3 = new Decl3();
                expect(block3.val(undefined, 'value2')).to.equal(value.part2.part21.part211.value2);
                expect(block3.val(undefined, 'value3')).to.equal(value.part2.part21.part211.value3);
                expect(block3.val(undefined, 'value2')).to.equal(block1.val.part2.part21.part211.value2);
                expect(block3.val(undefined, 'value3')).to.equal(block1.val.part2.part21.part211.value3);
                expect(block1.val.part2.part21.part211).to.eql(value.part2.part21.part211);
                expect(BEM.dataBindVal('ns2').part2.part21.part211).to.eql(value.part2.part21.part211);
                block3.val({value2: randomValue(), value3: randomValue()});
                setTimeout(function () {
                    promise.fulfill();
                }, 200);

                promise = Vow.promise();
                return promise;
            })
            .then(function () {
                expect(block3.val(undefined, 'value2')).to.equal(BEM.dataBindVal('ns2').part2.part21.part211.value2);
                expect(block3.val(undefined, 'value3')).to.equal(BEM.dataBindVal('ns2').part2.part21.part211.value3);
                expect(block3.val(undefined, 'value2')).to.equal(block1.val.part2.part21.part211.value2);
                expect(block3.val(undefined, 'value3')).to.equal(block1.val.part2.part21.part211.value3);
                expect(BEM.dataBindVal('ns2').part2.part21.part211).to.not.eql(value.part2.part21.part211);
                expect(block1.val.part2.part21.part211).to.not.eql(value.part2.part21.part211);

                block1.destruct();
                block2.destruct();
                block3.destruct();
            })
            .done();

        });
    });

});
