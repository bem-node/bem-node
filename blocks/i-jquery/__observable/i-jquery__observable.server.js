var safeRequire = require('../../safe-require');

safeRequire([
    'islands/common.blocks/i-jquery/__observable/i-jquery__observable',
], function () {
    require('./observable');
});
