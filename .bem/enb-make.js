module.exports = require('../enb-make')
    .pages('pages/*')
    .noBEMHTML()
    .levels([
        'node_modules/bem-bl/blocks-common',
        'node_modules/bem-bl/blocks-desktop',
        'node_modules/bem-json',
        'blocks',
    ], true);
