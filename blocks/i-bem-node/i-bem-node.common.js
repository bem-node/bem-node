/**
 * Bem blocks generator
 */
(function () {
    this.BN = function (blockName) {
        return BEM.blocks[blockName];
    };
    var bem = BEM.DOM || BEM,
        /**
         * i-bem block generator
         * @constructor
         */
        Generator = function (blockName) {
            this._name = blockName;
            this._matchers = {};
        },
        isBrowser = Boolean(BEM.DOM),
        BN = this.BN,
        generators = [],
        bhMatchers = {},
        bh = BEM.blocks['i-bh'].bh(),
        /**
         * Adds bh matcher for block
         * @private
         *
         * @param {String} blockName
         * @param {Boolean} isJsInit
         */
        addBHMatchers = function (blockName, isJsInit) {
            var blockDataDeclName = '_data_' + blockName,
                blockJsInitDeclName = '_jsinit_' + blockName;
            //layout
            Object.keys(BEM.blocks[blockName])
                .filter(RegExp.prototype.test.bind(/^_bh_/))
                .forEach(function (methodName) {
                    if (!bhMatchers[methodName]) {
                        bhMatchers[methodName] = true;
                        var matcher = methodName.replace(/^_bh_/, '');
                        bh.match(matcher, function (ctx, params) {
                            try {
                                return BEM.blocks[blockName][methodName](ctx, params);
                            } catch (err) {
                                return BN._bhErrorReporter(matcher, err);
                            }

                        });
                    }
                });
            //add js=true for blocks with .init or .onSetMod.js
            if (!bhMatchers[blockJsInitDeclName] && isJsInit) {
                bhMatchers[blockJsInitDeclName] = true;
                bh.match(blockName, function (ctx) {
                    return ctx.applyBaseAsync().then(function (res) {
                        ctx.js(true);
                        return res;
                    });
                });
            }
            //data
            if (BEM.blocks[blockName][blockDataDeclName] && !bhMatchers[blockDataDeclName]) {
                bhMatchers[blockDataDeclName] = true;
                setTimeout(function () {
                    bh.match(blockName, function (ctx, params) {
                        return Vow.promise(BEM.blocks[blockName][blockDataDeclName](ctx, params)).then(function () {
                            return ctx.applyBaseAsync();
                        }).fail(BN._bhErrorReporter.bind(BN, blockName));
                    });
                });
            }
        },
        autoinit, bemDomInit;
    if (isBrowser) {
        bemDomInit = BEM.DOM.init.bind(BEM.DOM);
        BEM.DOM.init = function () {
            BN.init();
            return bemDomInit.apply(BEM.DOM, arguments);
        };
        autoinit = true;
    }
    /**
     *  Call done for all new generators
     */
    BN.init = function () {
        while (generators.length) {
            generators.shift().done();
        }
    };
    /**
     * Defines behavior wnen error occurs in bh match callback
     *
     * @param {String} blockName
     * @param {Error} err
     * @returns {Object} bemjson to replace failed block
     */
    BN._bhErrorReporter = function (blockName, err) {
        console.error('Error in ' + blockName);
        console.error(err);
        if (isBrowser) {
            setTimeout(function () {
                throw err;
            });
        }
        return [];
    };
    /**
     * Adds decls for bem-node pages
     */
    BN._addDeclForPage = function (blockName, options) {
        var generator = BN.addDecl(blockName).baseBlock('i-page');
        options = options || {};
        if (options.route) {
            BN('i-router').define(options.route, blockName);
        }
        return generator;

    };
    /**
     * Adds decls for bem-node ajax blocks
     */
    BN._addDeclForAjax = function (blockName, options) {
        var generator = BN.addDecl(blockName).baseBlock('i-api-request');
        options = options || {};
        if (options.apiHost) {
            generator.staticProp({
                _apiHost: options.apiHost
            });
        }
        if (BN('i-ajax-proxy')) {
            BN('i-ajax-proxy').allowBlock(blockName);
        }
        return generator;

    };
    /**
     * Add decl for block
     *
     * @param {String} blockName
     * @param {String} [type] page or ajax
     * @param {Object} [options]
     * @returns {Generator} generator bem-node block generator
     */
    BN.addDecl = function (blockName, type, options) {
        var addMethodName, generator;
        if (arguments.length > 1) {
            addMethodName = '_addDeclFor' + type.charAt(0).toUpperCase() + type.slice(1);
            if (BN[addMethodName]) {
                return BN[addMethodName](blockName, options);
            } else {
                throw new Error('No method for type ' + type);
            }
        } else {
            generator = new Generator(blockName);
            generators.push(generator);
            if (!autoinit) {
                autoinit = setTimeout(function () {
                    BN.init();
                });
            }
            return generator;
        }
    };
    Generator.prototype = {
        /**
         * Adds bh matchers for tree like declaration
         */
        _addMatchersByMode: function (prefix, decl) {
            var _this = this;
            switch (typeof decl) {
            case 'function':
                this._matchers[prefix] = decl;
                break;
            case 'object':
                Object.keys(decl).forEach(function (mod) {
                    if (typeof decl[mod] === 'function') {
                        _this._matchers[prefix + '_' + mod] = decl[mod];
                    } else {
                        throw new Error('Expected ' + prefix + '_' + mod + ' to be a function');
                    }

                });
                break;
            default:
                throw new Error(prefix + ' to be a function or object');
            }
        },

        /**
         * defines base block
         *
         * @param {String} blockName
         * @returns {Generator}
         */
        baseBlock: function (blockName) {
            if (!this._baseBlock) {
                this._baseBlock = blockName;
                return this;
            } else {
                throw new Error('Cant base from multiple blocks');
            }
        },

        /**
         * Defines properies and methods for block instance
         *
         * @param {Object} delc with methods and properies
         * @returns {Generator}
         */
        instanceProp: function (decl) {
            this._instanceProp = jQuery.extend(this._instanceProp || {}, decl);
            return this;
        },

        /**
         * Defines static properies and methods for block
         *
         * @param {Object} delc with methods and properies
         * @returns {Generator}
         */
        staticProp: function (decl) {
            this._staticProp = jQuery.extend(this._staticProp || {}, decl);
            return this;
        },

        /**
         * Defines behavior of block on mod change
         *
         * @param {Object} decl
         * @param {Function} decl[%modName%]
         * @returns {Generator}
         */
        onSetMod: function (decl) {
            this._onSetMod = jQuery.extend(this._onSetMod || {}, decl);
            return this;
        },


        /**
         * Add bh templates for block elements
         *
         * @param {Object} decl
         * @param {Object|Function} decl[%elemName%] mod templates or elem template
         * @param {Function} decl[%elemName%][%modName%] elem template
         * @returns {Generator}
         */
        elemTemplate: function (decl) {
            Object.keys(decl).forEach(function (elem) {
                this._addMatchersByMode(this._name + '__' + elem, decl[elem]);
            }.bind(this));
            return this;
        },

        /**
         * Add bh templates for block
         *
         * @param {Object|Function} decl
         * @param {Function} decl[%modName%] block template
         * @returns {Generator}
         */
        blockTemplate: function (decl) {
            this._addMatchersByMode(this._name, decl);
            return this;
        },

        /**
         * Add demplate for collecting data
         *
         * @param {Object|Function} decl data template
         * @returns {Generator}
         */
        dataTemplate: function (decl) {
            if (!this._blockData) {
                this._blockData = decl;
            } else {
                throw new Error('Multiple data handlers is not supported');
            }
            return this;
        },

        /**
         * Generate i-bem block
         */
        done: function () {
            var staticDecl = this._staticProp || {},
                instanceDecl = this._instanceProp || {},
                declName = {
                    block: this._name
                },
                isJsInit;
            if (this._baseBlock) {
                declName.baseBlock = this._baseBlock;
            }
            if (this._onSetMod) {
                instanceDecl = jQuery.extend(instanceDecl, {
                    onSetMod: this._onSetMod
                });
            }
            Object.keys(this._matchers).forEach(function (match) {
                staticDecl['_bh_' + match] = this._matchers[match];
            }.bind(this));
            if (this._blockData) {
                staticDecl['_data_' + this._name] = this._blockData;
            }
            if (BEM.DOM && !BEM.blocks[this._name]) {
                bem.decl(declName, {
                    _init: function () {
                        this.__self.__instances.push(this);
                        this.__self.__lastInstance = this;
                        this.__base();
                        if (jQuery.isFunction(this.init)) {
                            try {
                                this.init();
                            } catch (err) {
                                setTimeout(function () {
                                    throw err;
                                });
                            }
                        }
                        return this;
                    },
                    destruct: function () {
                        var _this = this;
                        this.__self.__instances = this.__self.__instances.filter(function (instance) {
                            return instance !== _this;
                        });
                        this.__self.__lastInstance = this.__self.__instances.length ? this.__self.__instances[this.__self.__instances.length - 1] : null;
                        return this.__base.apply(this, arguments);
                    }
                }, {
                    __instances: [],
                    __lastInstance: null
                });
                //prevent second declaration with base block
                delete declName.baseBlock;
            }
            isJsInit = instanceDecl.init ||
                (instanceDecl.onSetMod && instanceDecl.onSetMod.js);
            bem.decl(declName, instanceDecl, staticDecl);
            addBHMatchers(
                this._name,
                isJsInit
            );
        }
    };

}());

