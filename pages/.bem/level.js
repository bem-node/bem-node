var extend = require('bem/lib/util').extend,
    techFolder = __dirname + '/../../.bem/techs/';

exports.getTechs = function() {

    return {
        'bemdecl.js': 'bemdecl.js',
        'deps.js': 'deps.js',
        'js': techFolder + 'js.js',
        'priv.js': techFolder + 'priv.js.js'
    };

};

exports.getConfig = function() {

    return extend({}, this.__base() || {}, {

        bundleBuildLevels: this.resolvePaths([
            '../../blocks'
        ])

    });

};
