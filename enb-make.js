var build = require('enb/lib/build-flow'),
    cwd = process.cwd(),
    projectLevels = ['blocks'],
    js, priv, server;

function getLevels(config) {
    return [
        'node_modules/bem-node/node_modules/bem-bl/blocks-common',
        'node_modules/bem-node/node_modules/bem-bl/blocks-desktop',
        'node_modules/bem-node/node_modules/bem-json',
        'node_modules/bem-node/blocks',
    ]
        .concat(projectLevels)
        .map(function (levelPath) { return config.resolvePath(levelPath); });
}

function makeIncludes() {
    return Array.prototype.map.call(arguments, function (arg) {
        if (typeof arg === 'string') {
            return "include('" + arg.replace(cwd, '../..') + "');";
        } else if (Array.isArray(arg)) {
            return makeIncludes.apply(null, arg.map(function (file) {
                return file && file.fullname;
            }));
        } else {
            return '';
        }
    }).join('\n') + '\n';
}
function makeRequires() {
    return makeIncludes.apply(null, arguments)
        .replace(/include\(/g, 'require(');
}

js = build.create()
    .name('js')
    .target('target', '?.js')
    .useSourceFilename('templates', '?.bemhtml.js')
    .useFileList(['common.js', 'js'])
    .builder(makeIncludes)
    .createTech();

priv = build.create()
    .name('priv.js')
    .target('target', '?.priv.js')
    .useFileList(['common.js', 'priv.js'])
    .builder(makeRequires)
    .createTech();

server = build.create()
    .name('server.js')
    .target('target', '?.server.js')
    .useFileList('server.js')
    .builder(makeRequires)
    .createTech();

function enbMake(config) {
    config.node('pages/index', function(nodeConfig) {
        nodeConfig.addTechs([
            [ require('enb/techs/levels'), { levels: getLevels(config) } ],
            [ require('enb/techs/file-provider'), { target: '?.bemdecl.js' } ],
            require('enb/techs/deps-old'),
            require('enb/techs/files'),
            require('enb/techs/css'),
            require('enb-bemhtml/techs/bemhtml'),
            server,
            priv,
            js
        ]);

        nodeConfig.addTargets([
            '?.server.js',
            '?.priv.js',
            '?.js',
            '?.css',
            '?.bemhtml.js'
        ]);

    });
};

enbMake.levels = function (levels) {
    projectLevels = levels;
    return this;
}
module.exports = enbMake;
