/**
 * Overrides 'i-bem__dom' with data binding interface methods
 */
BEM.decl('i-bem__dom', {

    /**
     * Removes data bindings when block destructs
     *
     * @override
     */
    destruct: function () {
        this.unbindFromData();
        return this.__base.apply(this, arguments);
    }

    // list of methods that must be linked from 'i-bem' for proper data binding work in 'i-bem__dom'
}, ['bindToData', 'unbindFromData', 'dataBindVal', 'suspendDataBind', 'decl'].reduce(function (staticProps, bemFnName) {
    staticProps[bemFnName] = BEM[bemFnName];
    return staticProps;
}, {}));
