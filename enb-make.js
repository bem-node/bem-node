var build = require('enb/lib/build-flow'),
    cwd = process.cwd(),
    projectLevels = ['blocks'],
    defaultLevels = [
        'node_modules/bem-node/node_modules/bem-bl/blocks-common',
        'node_modules/bem-node/node_modules/bem-bl/blocks-desktop',
        'node_modules/bem-node/node_modules/bem-json',
        'node_modules/bem-node/blocks'
    ],
    bemhtml = true,
    freeze = false,
    pages = 'pages/*',
    js, priv, server,
    serverTests, clientTests;

function getLevels(config) {
    return defaultLevels
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

serverTests = build.create()
    .name('server.tests.js')
    .target('target', '?.server.tests.js')
    .useSourceFilename('application', '?.server.js')
    .useFileList(['common.tests.js', 'priv.tests.js'])
    .builder(makeRequires)
    .createTech();

clientTests = build.create()
    .name('client.tests.js')
    .target('target', '?.client.tests.js')
    .useFileList(['common.tests.js', 'tests.js'])
    .builder(makeIncludes)
    .createTech();

function enbMake(config) {

    if (bemhtml) {
        js = js
            .buildFlow()
            .useSourceFilename('templates', '?.bemhtml.js')
            .createTech();
    }
    config.mode('development', function () {
        config.nodes(pages, function (nodeConfig) {
            nodeConfig.addTechs([
                [ require('enb/techs/levels'), { levels: getLevels(config) } ],
                [ require('enb/techs/file-provider'), { target: '?.bemdecl.js' } ],
                require('enb/techs/deps-old'),
                require('enb/techs/files'),
                require('enb/techs/css-includes'),
                server,
                priv,
                js,
                serverTests,
                clientTests
            ]);


            nodeConfig.addTargets([
                '?.server.js',
                '?.priv.js',
                '?.js',
                '?.css',
                '?.server.tests.js',
                '?.client.tests.js'
            ]);

            if (bemhtml) {
                nodeConfig.addTechs([require('enb-bemhtml/techs/bemhtml')]);
                nodeConfig.addTarget('?.bemhtml.js');
            }

        });
    });

    config.mode('production', function () {
        js = js
            .buildFlow()
            .justJoinFilesWithComments()
            .createTech();

        config.nodes(pages, function (nodeConfig) {
            nodeConfig.addTechs([
                [ require('enb/techs/levels'), { levels: getLevels(config) } ],
                [ require('enb/techs/file-provider'), { target: '?.bemdecl.js' } ],
                [ require('enb/techs/borschik'), { sourceTarget: '?.js', destTarget: '_?.js', minify: true, freeze: freeze } ],
                [ require('enb/techs/borschik'), { sourceTarget: '?.css', destTarget: '_?.css', minify: true, freeze: freeze } ],
                require('enb/techs/deps-old'),
                require('enb/techs/files'),
                require('enb/techs/css-includes'),
                server,
                priv,
                js,
                tests
            ]);


            nodeConfig.addTargets([
                '?.server.js',
                '?.priv.js',
                '_?.js',
                '_?.css',
                '?.tests.js'
            ]);

            if (bemhtml) {
                nodeConfig.addTechs([require('enb-bemhtml/techs/bemhtml')]);
                nodeConfig.addTarget('?.bemhtml.js');
            }

        });
    });

}

/**
 * Setting project levels
 *
 * @ex
 *   module.exports('bem-node/enb-make')
 *      .levels('project-blocks')
 *
 * @param {Array} levels Project levels
 * @pages {Bolean} [noConcat = false] if true default levels will be removed
 */
enbMake.levels = function (levels, noConcat) {
    if (noConcat) {
        defaultLevels = [];
    }
    projectLevels = levels;
    return this;
};

/**
 * Setting project pages
 *
 * @ex
 *   module.exports('bem-node/enb-make')
 *      .pages('project-pages/*')
 *
 * @param {String} inPages mask of pages name
 */
enbMake.pages = function (inPages) {
    pages = inPages;
    return this;
};


/**
 * Removed bemhtml from build techs
 *
 * @ex
 *   module.exports('bem-node/enb-make')
 *      .noBEMHTML()
 */
enbMake.noBEMHTML = function () {
    bemhtml = false;
    return this;
}

/**
 * Use freeze in production mode
 *
 * @ex
 *   module.exports('bem-node/enb-make')
 *      .freeze()
 */
enbMake.freeze = function () {
    freeze = true;
    return this;
}

module.exports = enbMake;
