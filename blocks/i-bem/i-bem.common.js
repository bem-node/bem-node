(function (global) {
    global.BN = function (blockName) { return BEM.blocks[blockName]; };
}(typeof window !== 'undefined' ? window : global));
