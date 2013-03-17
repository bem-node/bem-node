var extend = require('bem/lib/util').extend,
    techFolder = __dirname + '/techs/';

// level.js
exports.getTechs = function() {

    return {
        'bemdecl.js': 'bemdecl.js',
        'deps.js': 'deps.js',
        'js': techFolder + 'js.js',
        'priv.js': techFolder + 'priv.js.js',
        'server.js': techFolder + 'server.js.js'
    };

};

// level.js
exports.getConfig = function() {

    return extend({}, this.__base() || {}, {

        bundleBuildLevels: this.resolvePaths([
            __dirname + '/bem-bl/blocks-common',
            __dirname + '/blocks'
        ])

    });

};

