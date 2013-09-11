module.exports = require('../enb-make')
    .pages('pages/tests')
    .noBEMHTML()
    .levels([
        'node_modules/bem-bl/blocks-common',
        'node_modules/bem-bl/blocks-desktop',
        'node_modules/bem-json',
        'blocks',
    ], true);
