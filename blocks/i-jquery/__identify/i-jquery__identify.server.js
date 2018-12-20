var safeRequire = require('../../safe-require');

safeRequire([
    'islands/common.blocks/i-jquery/__identify/i-jquery__identify',
], function () {
    require('./identify');
});
