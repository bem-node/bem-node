/**
 * Provides subscriptions on data changes
 */
(function ($, BEM) {

    var storageKey = '__' + Number(new Date()) + 'binding',
        channel = BEM.channel(storageKey),
        dataBindings = {},
        bemProto, BD;

    /**
     * Creates function that will be called in given context
     * If given method name doesn't exist in given context - returns null
     *
     * @param {String|Function} fnOrName Function or method name from given context
     * @param {Object} scope Context for function
     * @returns {Function}
     */
    function createFn(fnOrName, scope) {
        var fn = fnOrName;

        if (!$.isFunction(fn)) {
            fn = $.isFunction(fn = scope[fnOrName]) ? fn : null;
        }

        return fn && fn.bind(scope);
    }

    /**
     * Creates setter method for data binder
     * If 'set' is a property name in given context,
     *  will create function that sets value of this property
     *
     * @param {String|Function} set Function, method or property name from given context
     * @param {Object} scope Context for function
     * returns {Function}
     */
    function createSetter(set, scope) {
        return createFn(set, scope)
            || (new Function('value', 'this["' + set.replace(/\./g, '"]["') + '"] = value;')).bind(scope);
    }

    /**
     * Creates getter method for data binder
     * If 'get' is a property name in given context,
     *  will create function that returns value of this property
     *
     * @param {String|Function} get Function, method or property name from given context
     * @param {Object} scope Context for function
     * returns {Function}
     */
    function createGetter(get, scope) {
        return createFn(get, scope)
            || (new Function('return this["' + get.replace(/\./g, '"]["') + '"];')).bind(scope);
    }

    /**
     * Calls given function with given params for each data binding
     *  specified in name (if given) or with each data binding from given context
     *
     * @param {String|Array|Object} name Single binding name, array of binding names or context
     * @param {Object} scope Context
     * @param {Function} fn Function that will process data bindings
     * @param {String} fn.arguments[0] Data binding name
     * @param {Objcet} fn.arguments[1] Context with binders
     * @param {Mixed} fn.arguments[2] Custom data for 'fn'
     * @param {Mixed} [fnParams] Custom data that will be passed to 'fn'
     */
    function processBindings(name, scope, fn, fnParams) {
        if (typeof name === 'string') {
            name = [name];
        } else if (name && !Array.isArray(name)) {
            scope = name;
            name = null;
        }

        (name || Object.keys(scope[storageKey] || {})).forEach(function (name) {
            fn(name, scope, fnParams);
        });
    }


    BD = $.inherit({}, {

        /**
         * Retrieves data binding by binding name
         * Creates data binding if 'force' param given
         *
         * @param {String} name Binding name
         * @param {Boolean} [force=false] If true, will create binding if it doesn't exest
         * @returns {Object}
         */
        getBinding: function (name, force) {
            var binding = dataBindings[name];

            if (!binding && force) {
                binding = dataBindings[name] = new this.Binding({name: name});
            }

            return binding;
        },

        /**
         * Retrieves/creates data binder for given context
         *
         * @param {String} name Binding name
         * @param {Object} scope Binder context
         * @returns {Object}
         */
        getBinder: function (name, scope) {
            var binders = scope[storageKey] || (scope[storageKey] = {}),
                binder = binders[name],
                id, binding, nsName;

            if (!binder) {
                binder = new this.Binder({name: name});
                id = $.identify(binder);
                binding = this.getBinding(name, true);
                binders[name] = binding.binders[id] = binder;

                if (name.indexOf('.') > -1) {
                    binders = name.split('.');
                    while ((name = binders.pop()) && binders.length) {
                        nsName = binders.join('.');
                        this.getBinder(nsName, scope);
                        this.getBinding(nsName).addProp(name);
                    }
                }
            }

            return binder;
        },

        /**
         * Processiong function for 'processBindings' method
         * Unbinds data binders with specified binding name in given context
         *
         * @param {String} name Data binding name
         * @param {Object} scope Context with binders
         */
        unbindFromData: function (name, scope) {
            var binding = BD.getBinding(name),
                binders = scope[storageKey] || {},
                binder = binders[name] || {};

            delete binding.binders[$.identify(binder)];
            delete binders[name];

            if (binder.event && binder.get) {
                scope.un(binder.event, binder.eventListener, binder);
            }
            if (binder.set) {
                channel.un(name, binder.dataListener, binder);
            }

            if (!Object.keys(binding.binders).length) {
                delete dataBindings[name];
            }

            if (name.indexOf('.') > -1) {
                binders = name.split('.');
                name = binders.pop();
                if ((binding = BD.getBinding(binders.join('.')))) {
                    binding.removeProp(name);
                }
            }
        },

        /**
         * Processiong function for 'processBindings' method
         * Setups suspend state for data binders with specified binding name in given context
         *
         * @param {String} name Data binding name
         * @param {Object} scope Context with binders
         * @param {Boolean} isSuspend Suspend state value
         */
        suspendBinding: function (name, scope, isSuspend) {
            var binder = (scope[storageKey] || {})[name];

            if (binder) {
                binder.suspended = isSuspend;
            }
        },

        /**
         * Prepares data bindings in properties and static properties for given declaration:
         *  replace 'dataBindings' property with '_getDataBindings' method
         *  that extends 'dataBindings' overrides
         * Only block data binding may be overriden
         * Note: Method must be called before original 'BEM.decl'
         *
         * @param {String|Object} decl Block name or description
         * @param {Object} [props] Block properties
         * @param {Object} [staticProps] Static block properties
         */
        prepareDataBindings: function (decl, props, staticProps) {
            var propsBindings, staticBindings;

            if (props && props.dataBindings) {
                propsBindings = props.dataBindings;
                delete props.dataBindings;
                props._getDataBindings = function () {
                    return Object.keys(propsBindings).reduce(function (opts, propsKey) {
                        if (typeof propsBindings[propsKey] === 'string') {
                            propsBindings[propsKey] = {accessor: propsBindings[propsKey]};
                        }
                        opts[propsKey] = $.extend(opts[propsKey], propsBindings[propsKey]);
                        return opts;
                    }, this.__base() || {});
                };
            }

            if (staticProps && staticProps.dataBindings) {
                staticBindings = staticProps.dataBindings;
                delete staticProps.dataBindings;
                staticProps._getDataBindings = function () {
                    return staticBindings;
                };
            }
        },

        /**
         * Creates data bindings for given bem block
         * Note: Method must be called after 'prepareDataBindings'
         *
         * @param {Object} block Bem block
         */
        createDataBindings: function (block) {
            if (block._getDataBindings) {
                block.bindToData(block._getDataBindings());
                block._getDataBindings = false;
            }
        },

        /**
         * Process init accessor
         *
         * @param {BD.Binder} binder
         * @param {Object} opts
         * @param {BEM} scope
         */
        runInitAccessor: function (binder, opts, scope) {
            var accessor = opts.initAccessor,
                name = binder.name,
                value = BEM.dataBindVal(name),
                fn, newValue;

            // if 'initAccessor' is a function ..
            if ((fn = createFn(accessor, scope))) {
                // .. call it with current binding value
                //  if it returns some value, then this value will be newValue value for binding
                //  if it doesn't return value, then binding will keep current value
                newValue = fn(value, binder.nameSufix, name);
            // if 'initAccessor' is a string value - it is a path to property
            } else if (typeof accessor === 'string') {
                newValue = accessor.split('.').reduce(function (obj, part, idx, all) {
                    if (idx === all.length - 1) {
                        // if property is undefined ..
                        // .. assign current binding value to this property
                        // .. otherwise read newValue from this property
                        return (obj[part] === undefined) ? (obj[part] = value) : obj[part];
                    }
                    return obj[part] || (obj[part] = {});
                }, scope);
            }

            if (newValue !== undefined && !$.equals(newValue, value)) {
                BEM.dataBindVal(name, newValue);
            }
        },

        /**
         * Binds to event to handle data change
         * Checks is data getter given and make
         *
         * @param {BD.Binder} binder
         * @param {Object} opts
         * @param {BEM} scope
         */
        createGetter: function (binder, opts, scope) {
            var accessor = opts.get || opts.accessor;

            if (accessor) {
                binder.get = createGetter(accessor, scope);
            }
            scope.on(binder.event = opts.event, binder.eventListener, binder);
        },

        /**
         * Create 'set' method and setup data listener
         *
         * @param {BD.Binder} binder
         * @param {Object} opts
         * @param {BEM} scope
         */
        createSetter: function (binder, opts, scope) {
            binder.set = createSetter(opts.set || opts.accessor, scope);
            channel.on(binder.name, binder.dataListener, binder);
        },


        /**
         * Binding constructor
         * Store relations between data binding key and list of binders
         *
         * @param {Object} opts Initial binding properties
         * @param {String} opts.name Data binding name
         */
        Binding: function (opts) {
            this.value = null;
            this.binders = {};
            this.props = {};
            $.extend(this, opts);
        },

        /**
         * Binder constructor
         * Store relation between data binding key and context
         *
         * @param {Object} opts Initial binder properties
         * @param {String} opts.name Data binding name
         */
        Binder: function (opts) {
            var name = opts.name,
                idx;
            this.nameSufix = (idx = name.lastIndexOf('.')) > 0 ? name.slice(idx + 1) : name;
            $.extend(this, opts);
        }

    });


    BD.Binding.prototype = {

        /**
         * Adds property to data binding ns
         *
         * @param {String} name Property name
         */
        addProp: function (name) {
            // must wait till all props change
            if (!this.ns) {
                this.ns = true;
                this.trigger = $.debounce(this.trigger, 50, this);
            }
            // before adding new property to ns, set current value to new binding
            if (!this.props[name]) {
                BD.getBinding(this.name + '.' + name).set(this.get(name), true);
                this.props[name] = 0;
            }
            this.props[name] ++;
        },

        /**
         * Removes property from data binding ns
         *
         * @param {String} name Property name
         */
        removeProp: function (name) {
            this.props[name] --;
            if (!this.props[name]) {
                delete this.props[name];
            }
        },

        /**
         * Triggers data binding change event
         */
        trigger: function () {
            if (dataBindings[this.name]) {
                channel.trigger(this.name, this.get());
            }
        },

        /**
         * Get current value
         *
         * @param {String} [property]
         * @returns {Mixed}
         */
        get: function (property) {
            var value = JSON.parse(this.value),
                name = this.name;

            if (property) {
                value = (value || {})[property];
                return value === undefined ? null : value;
            }
            if (this.ns) {
                value = value || {};
                Object.keys(this.props).forEach(function (key) {
                    value[key] = BD.getBinding(name + '.' + key).get();
                }, this);
            }

            return value;
        },

        /**
         * Writes value to binding
         *
         * @param {Mixed} value
         * @param {Boolean} [silent=false] Don't trigger event
         */
        set: function (value, silent) {
            var name = this.name,
                idx;

            if ($.equals(this.get(), value)) {
                return ;
            }

            this.value = JSON.stringify(value);
            if (this.ns) {
                value = value || {};
                Object.keys(this.props).forEach(function (key) {
                    BD.getBinding(name + '.' + key).set(value[key] === undefined ? null : value[key], silent);
                });
            } else if (!silent) {
                this.trigger();
                while ((idx = name.lastIndexOf('.')) > 0) {
                    name = name.slice(0, idx);
                    BD.getBinding(name).trigger();
                }
            }
        }

    };

    BD.Binder.prototype = {

        /**
         * Event listener for context: handles context event(s)
         * Sets new value from context to data binding if binder not suspended
         */
        eventListener: function (e, data) {
            if (this.suspended !== true) {
                data = this.get ? this.get(undefined, this.nameSufix, this.name) : data;
                BEM.dataBindVal(this.name, data);
            }
        },

        /**
         * Data binding listener: handles data change event
         * Sets new value from data binding to context if binder not suspended
         *
         * @param {Event} e Data change event
         * @param {Mixed} data New value
         */
        dataListener: function (e, data) {
            if (this.suspended !== true) {
                this.set(data, this.nameSufix, this.name);
            }
        }

    };


    bemProto = {

        /**
         * Provides data binding
         *
         * @param {String|Object} name Data binding or ns name or list of data bindings: key - name, value - opts
         * @param {Object} opts Binding options
         * @param {String} opts.event Event to handle for data change in context. Will take data from event if no opts.get or opts.accessor specified.
         * @param {String|Function} opts.accessor Method, method or property name in context for getting and setting value from/to context
         * @param {String|Function} opts.get Method, method or property name in context getting for value from context. Requires 'opts.event'
         * @param {String|Function} opts.set Method, method or property name in context setting for value to context
         * @param {String|Function|Boolean} opts.initAccessor Method, method or property name in context for processing initial data binding value.
         *  if true then value from data binding will be set to binder
         * @param {Object} [scope=this] Context for data binder
         * @returns {Object} self
         */
        bindToData: function (name, opts, scope) {
            var binder;

            if (typeof name === 'string' && opts) {
                scope = scope || this;
                binder = BD.getBinder(name, scope);
                if (typeof opts !== 'object') {
                    opts = {accessor: opts};
                }
                if (opts.initAccessor) {
                    BD.runInitAccessor(binder, opts, scope);
                }
                if (!binder.event && opts.event) {
                    BD.createGetter(binder, opts, scope);
                }
                if (!binder.set && (opts.set || opts.accessor)) {
                    BD.createSetter(binder, opts, scope);
                }
            } else if (typeof name === 'object') {
                Object.keys(name).forEach(function (param) {
                    this.bindToData(param, name[param], scope || opts);
                }, this);
            }

            return this;
        },

        /**
         * Provides unbind from data bindings
         *
         * @param {String|Array|Object} [name] Data binding name(s) or context. If not specified will unbind from all bindings in given context
         * @param {Object} [scope=this] Data binding context
         * @returns {Object} self
         */
        unbindFromData: function (name, scope) {
            processBindings(name, scope || this, BD.unbindFromData);
            return this;
        },

        /**
         * Accessor for data binding value
         *
         * @param {String} name Data binding name or data binding ns name
         * @param {Mixed} [value] If given, will set as new value to data binding
         * @param {Boolean} [extend=false] If given, will extend current namespace params
         * @returns {Mixed} If 'value' is undefined return current value, othrwise return self
         */
        dataBindVal: function (name, value, extend) {
            var binding;

            if (typeof name !== 'string') {
                Object.keys(name).forEach(function (key) {
                    BEM.dataBindVal(key, name[key], value);
                });
                return this;
            }

            binding = BD.getBinding(name);

            if (value === undefined) {
                return binding ? binding.get() : value;
            }

            if (!binding) {
                throw ('Data bind "' + name + '" is undefined');
            }

            // set new value to dataBindings
            if (extend) {
                value = $.extend(this.dataBindVal(name), value);
            }
            binding.set(value);

            return this;
        },

        /**
         * Setups suspend state for data binding(s)
         *
         * @param {Boolean} [isSuspend=true] Suspend state value
         * @param {String|Array|Object} [name] Data binding name(s) or context. If not specified will set suspend state for all bindings in given context
         * @param {Object} [scope=this] Data binding context
         * @returns {Object} self
         */
        suspendDataBind: function (isSuspend, name, scope) {
            processBindings(name, scope || this, BD.suspendBinding, (isSuspend === undefined) ? true : Boolean(isSuspend));
            return this;
        }

    };


    /**
     * Override BEM methods
     */
    $.inheritSelf(BEM, $.extend({

        /**
         * Creates data bindings after bem-block initialization
         *
         * @override
         */
        _init: function () {
            var base = this.__base.apply(this, arguments);
            BD.createDataBindings(this);
            return base;
        },

        /**
         * Removes data bindings when block destructs
         *
         * @override
         */
        destruct: function () {
            this.unbindFromData();
            return this.__base.apply(this, arguments);
        }

    }, bemProto), $.extend({

        _dataBinding: BD,

        /**
         * Prepares data bindings to prevent overriding 'dataBindings' property
         * Creates static data bindings
         *
         * @override
         */
        decl: function () {
            var decl;

            BD.prepareDataBindings.apply(this, arguments);
            decl = this.__base.apply(this, arguments);
            BD.createDataBindings(decl);

            return decl;
        }

    }, bemProto));

}(jQuery, BEM));
