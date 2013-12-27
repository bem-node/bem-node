BEM.decl('i-router', null, {
    
    init: function () {
        var route;
        this.__base.apply(this, arguments); 

        route = this._getRoute(location.pathname);
        route.handler.lastMatches = route.matchers;
        route.handler.pageInstance = this._createInstance(route.handler.blockName);
    },

    _createInstance: function (blockName) {
        var pageInstance = BEM.create({
            block: blockName,
            mods: this.get('params')
        });
        pageInstance.setMod('js', 'inited');
        return pageInstance;
    },

    _createHandler: function (blockName) {
        var _this = this;

        return {
            lastMatches: null,
            pageInstance: null,
            blockName: blockName,
            /**
            * Will create instance of page to handle its params 
            */
            enter: function () {
                this.pageInstance = _this._createInstance(blockName);
                this.lastMatches = _this.get('matchers');
                BEM.blocks[blockName].init(this.lastMatches).done();
            },

            /**
            * Changing params (mods) of current page instance and calling of "update" static method of page
            */
            update: function () {
                var params = _this.get('params'),
                    handler = this,
                    newMatches;

                Object.keys(params).forEach(function (key) {
                    var i = handler.pageInstance.setMod(key, params[key]);
                });

                newMatches = _this.get('matchers');
                BEM.blocks[blockName].update(newMatches, this.lastMatches).done();
                this.lastMatches = newMatches;

            },
            leave: function () {
                if (this.pageInstance) {
                    this.pageInstance.destruct();
                    this.pageInstance = this.lastMatches = null;
                }
                BEM.blocks[blockName].destruct().done();
            }
        };
    }
})
