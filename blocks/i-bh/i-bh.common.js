/**
 * BH wrapper
 */
(function () {

    var getBH = function () {

        var _init = BH.prototype._init;

        // dirtyEnv detect that Object.prototype is not empty
        var dirtyEnv = false, i;
        for (i in {}) {
            dirtyEnv = true;
            break;
        }

        BH.prototype._init = function () {
            this.utils.applyBaseAsync = function (changes) {
                var prevCtx = this.ctx,
                    prevNode = this.node,
                    prevValues,
                    key;
                if (changes) {
                    prevValues = {};
                    for (key in changes) {
                        if (dirtyEnv && !changes.hasOwnProperty(key)) continue;
                        prevValues[key] = prevCtx[key];
                        prevCtx[key] = changes[key];
                    }
                }
                return this.bh.processBemJsonAsync(this.ctx, this.ctx.block, true).then(function (res) {
                    var key;
                    if (res !== prevCtx) {
                        this.newCtx = res;
                    }
                    if (changes) {
                        for (key in changes) {
                            if (dirtyEnv && !changes.hasOwnProperty(key)) continue;
                            prevCtx[key] = prevValues[key];
                        }
                    }
                    this.ctx = prevCtx;
                    this.node = prevNode;
                    return res;
                });
            };
            return _init.apply(this, arguments);
        };

        BH.prototype._processAsyncSubRes = function (json, blockName, arr, index, subRes) {
            if (subRes) {
                arr[index] = subRes;
                return this.processBemJsonAsync(subRes, blockName);
            } else {
                arr[index] = json;
                return this.processBemJsonAsync(json.content, blockName);
            }
        };

        BH.prototype.processBemJsonAsync = function (bemJson, blockName, ignoreContent) {
            /**
             * Враппер для json-узла.
             * @constructor
             */
            function Ctx() {
                this.ctx = null;
                this.newCtx = null;
            }
            Ctx.prototype = this.utils;

            if (!this._inited) {
                this._init();
            }
            var resultArr = [bemJson];
            var promise = Vow.promise();
            var promises = [promise];
            try {
                var nodes = [{ json: bemJson, arr: resultArr, index: 0, blockName: blockName, blockMods: bemJson.mods || {} }];
                var node, json, block, blockMods, i, l, p, child, subRes;
                var compiledMatcher = (this._fastMatcher || (this._fastMatcher = Function('ms', this.buildMatcher())(this._matchers)));
                var processContent = !ignoreContent;
                var infiniteLoopDetection = this._infiniteLoopDetection;

                var ctx = new Ctx();
                while (node = nodes.shift()) {
                    json = node.json;
                    block = node.blockName;
                    blockMods = node.blockMods;
                    if (Array.isArray(json)) {
                        for (i = 0, l = json.length; i < l; i++) {
                            child = json[i];
                            if (child !== false && child != null && typeof child === 'object') {
                                nodes.push({ json: child, arr: json, index: i, blockName: block, blockMods: blockMods, parentNode: node });
                            }
                        }
                    } else {
                        var content, stopProcess = false;
                        if (json.elem) {
                            block = json.block = json.block || block;
                            blockMods = json.blockMods = json.blockMods || blockMods;
                            if (json.elemMods) {
                                json.mods = json.elemMods;
                            }
                        } else if (json.block) {
                            block = json.block;
                            blockMods = json.mods || (json.mods = {});
                        }

                        if (json.block) {

                            if (infiniteLoopDetection) {
                                json.__processCounter = (json.__processCounter || 0) + 1;
                                if (json.__processCounter > 100) {
                                    throw new Error('Infinite loop detected at "' + json.block + (json.elem ? '__' + json.elem : '') + '".');
                                }
                            }

                            subRes = null;

                            if (!json._stop) {
                                ctx.node = node;
                                ctx.ctx = json;
                                subRes = compiledMatcher(ctx, json);
                                if (subRes) {
                                    if (Vow.isPromise(subRes)) {
                                        promises.push(subRes.then(this._processAsyncSubRes.bind(this, json, block, node.arr, node.index)));
                                        ctx = new Ctx();
                                    } else {
                                        json = subRes;
                                        node.json = json;
                                        node.blockName = block;
                                        node.blockMods = blockMods;
                                        nodes.push(node);
                                    }
                                    stopProcess = true;
                                }
                            }

                        }
                        if (!stopProcess) {
                            if (Array.isArray(json)) {
                                node.json = json;
                                node.blockName = block;
                                node.blockMods = blockMods;
                                nodes.push(node);
                            } else {
                                if (processContent && (content = json.content)) {
                                    if (Array.isArray(content)) {
                                        var flatten;
                                        do {
                                            flatten = false;
                                            for (i = 0, l = content.length; i < l; i++) {
                                                if (Array.isArray(content[i])) {
                                                    flatten = true;
                                                    break;
                                                }
                                            }
                                            if (flatten) {
                                                json.content = content = content.concat.apply([], content);
                                            }
                                        } while (flatten);
                                        for (i = 0, l = content.length, p = l - 1; i < l; i++) {
                                            child = content[i];
                                            if (child !== false && child != null && typeof child === 'object') {
                                                nodes.push({ json: child, arr: content, index: i, blockName: block, blockMods: blockMods, parentNode: node });
                                            }
                                        }
                                    } else {
                                        nodes.push({ json: content, arr: json, index: 'content', blockName: block, blockMods: blockMods, parentNode: node });
                                    }
                                }
                            }
                        }
                    }
                    node.arr[node.index] = json;
                }
                promise.fulfill();
            } catch (err) {
                promise.reject(err);
            }

            return Vow.all(promises).then(function () {
                return resultArr[0];
            });
        };


        return BH;
    };

    BEM.decl('i-bh', null, {

        /**
         * Add bh matchers
         *
         * @param {Object} matchersObj
         */
        match: function (matchersObj) {
            var bh = this.bh();
            Object.keys(matchersObj).forEach(function (selector) {
                bh.match(selector, matchersObj[selector]);
            });
        },

        /**
         * Returns  bh instance
         * @see https://github.com/enb-make/bh
         *
         * @returns {Object} bh
         */
        bh: function () {
            return this._bh || (this._bh = new (getBH())());
        }
    });
}());
