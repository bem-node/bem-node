module.exports = require('../enb-make')
    .pages('tests/*')
    /*.noBEMHTML()*/
    .levels([
        'node_modules/bem-bl/blocks-common',
        'node_modules/bem-bl/blocks-desktop',
        'node_modules/bem-json',
        'blocks',
        'tests.blocks'
    ], true);
