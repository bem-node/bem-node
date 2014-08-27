/**
 * render bem.json decls via bh
 */
(function (decl, bh, Ctx) {

    /**
     * replace Ctx._params null with []
     * @param  {BEM.JSON._ctx} ctx
     * @return {Bemjson}
     */
    var getResult = function (ctx) {
        return ctx._params || [];
    };

    /**
     * bh matcher for bem.json
     * @param  {BH.Ctx} bhCtx
     * @return {Bemjson|Promise.<{Bemjson}>}
     */
    var matcher = function (bhCtx) {
        var p,
            node = bhCtx.node,
            json = bhCtx.json(),
            position = bhCtx.position(),
            thread = {
                count: 0,
                callback: function () {}
            },
            bemJsonCtx = new Ctx(
                json,
                position,
                node.index === 'content' ? position : node.arr.length,
                json.elem ? {block: json.block, mods: json.blockMods} : undefined,
                bhCtx.tParam()
            );
        bemJsonCtx._globalThread = thread;
        bemJsonCtx._threads = 0;
        bemJsonCtx.build();
        if (thread.count === 0) {
            //sync build
            return getResult(bemJsonCtx);
        } else {
            //async build
            p = Vow.promise();
            thread.callback = function () {
                p.fulfill(getResult(bemJsonCtx));
            };
            return p;
        }
    };

    /**
     * defined matcherss
     * @type {Object.<{String} expression, {true}>}
     */
    var matchers = {};

    /**
     * add bh matcher once for each expression
     * @param  {String} expr
     */
    var match = function (expr) {
        if (!matchers[expr]) {
            matchers[expr] = true;
            bh.match(expr, matcher);
        }
    };

    /**
     * do not render contend with bem.json
     * @override
     */
    Ctx.prototype._buildInner = function (params) {
        return params;
    };

    /**
     * @override
     */
    Ctx.prototype.tParam = function () {
        throw new Error('tParam in not supported');
    };

    /**
     * @override
     */
    BEM.JSON.buildAsync = function () {
        throw new Error('BEM.JSON.buildAsync deprecated, use bh.processBemJsonAsync');
    };

    /**
     * @override
     */
    BEM.JSON.build = function () {
        throw new Error('BEM.JSON.build deprecated, use bh.processBemJson');
    };

    /**
     * add bh matchers for bem.jspn decls
     * @override
     */
    BEM.JSON.decl = function (desc, props) {
        var name = typeof desc === 'string' ? desc : desc.name;

        if (props.onBlock) {
            match(name);
        }
        if (props.onElem) {
            if (typeof props.onElem === 'function') {
                throw new Error('BEM.JSON onElem = func is not supported');
            }
            if (typeof props.onElem === 'object') {
                Object.keys(props.onElem).forEach(function (elem) {
                    match(name + '__' + elem);
                });
            }
        }
        return decl.apply(this, arguments);
    };
}(BEM.JSON.decl, BEM.blocks['i-bh'].bh(), BEM.JSON._ctx));
