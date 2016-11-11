#!/usr/bin/env node

var Path = require('path');
var Fs = require('fs');
var paths = [
    {
        link: 'blocks/i-jquery/_dummy/i-jquery_dummy_yes.server.js',
        files: [
            'node_modules/bem-bl/blocks-common/i-jquery/_dummy/i-jquery_dummy_yes.js',
            '../../node_modules/bem-bl/blocks-common/i-jquery/_dummy/i-jquery_dummy_yes.js'
        ]
    },
    {
        link: 'blocks/i-jquery/__identify/i-jquery__identify.server.js',
        files: [
            'node_modules/bem-bl/blocks-common/i-jquery/__identify/i-jquery__identify.js',
            '../../node_modules/bem-bl/blocks-common/i-jquery/__identify/i-jquery__identify.js'
        ]
    },
    {
        link: 'blocks/i-jquery/__inherit/i-jquery__inherit.server.js',
        files: [
            'node_modules/bem-bl/blocks-common/i-jquery/__inherit/i-jquery__inherit.js',
            '../../node_modules/bem-bl/blocks-common/i-jquery/__inherit/i-jquery__inherit.js'
        ]
    },
    {
        link: 'blocks/i-jquery/__is-empty-object/i-jquery__is-empty-object.server.js',
        files: [
            'node_modules/bem-bl/blocks-common/i-jquery/__is-empty-object/i-jquery__is-empty-object.js',
            '../../node_modules/bem-bl/blocks-common/i-jquery/__is-empty-object/i-jquery__is-empty-object.js'
        ]
    },
    {
        link: 'blocks/i-jquery/__observable/i-jquery__observable.server.js',
        files: [
            'node_modules/bem-bl/blocks-common/i-jquery/__observable/i-jquery__observable.js',
            '../../node_modules/bem-bl/blocks-common/i-jquery/__observable/i-jquery__observable.js'
        ]
    },
    {
        link: 'blocks/i-bem/i-bem.server.js',
        files: [
            'node_modules/bem-bl/blocks-common/i-bem/i-bem.js',
            '../../node_modules/bem-bl/blocks-common/i-bem/i-bem.js'
        ]
    },
    {
        link: 'blocks/i-bem/__json/i-bem__json.priv.js',
        files: [
            'node_modules/bem-json/i-bem/__json/i-bem__json.js',
            '../../node_modules/bem-json/i-bem/__json/i-bem__json.js'
        ]
    },
    {
        link: 'blocks/i-bem/__json/_async/i-bem__json_async_yes.priv.js',
        files: [
            'node_modules/bem-json/i-bem/__json/_async/i-bem__json_async_yes.js',
            '../../node_modules/bem-json/i-bem/__json/_async/i-bem__json_async_yes.js'
        ]
    },
    {
        link: 'blocks/i-bem/__html/i-bem__html.priv.js',
        files: [
            'node_modules/bem-json/i-bem/__html/i-bem__html.js',
            '../../node_modules/bem-json/i-bem/__html/i-bem__html.js'
        ]
    },
    {
        link: 'blocks/i-promise/i-promise.js',
        files: [
            'node_modules/vow/lib/vow.js',
            '../../node_modules/vow/lib/vow.js'
        ]
    },
    {
        link: 'blocks/i-bh/i-bh.js',
        files: [
            'node_modules/bh/lib/bh.js',
            '../../node_modules/bh/lib/bh.js'
        ]
    },
    {
        link: 'tests.blocks/mocha/mocha.js',
        files: [
            'node_modules/mocha/mocha.js',
            '../../node_modules/mocha/mocha.js'
        ]
    },
    {
        link: 'tests.blocks/mocha/mocha.css',
        files: [
            'node_modules/mocha/mocha.css',
            '../../node_modules/mocha/mocha.css'
        ]
    },
    {
        link: 'tests.blocks/chai/chai.js',
        files: [
            'node_modules/chai/chai.js',
            '../../node_modules/chai/chai.js'
        ]
    },
    {
        link: 'tests.blocks/chai/__as-promised/chai__as-promised.js',
        files: [
            'node_modules/chai-as-promised/lib/chai-as-promised.js',
            '../../node_modules/chai-as-promised/lib/chai-as-promised.js'
        ]
    }
];

function mkdirPSync (path) {
    path = Path.normalize(Path.resolve(process.cwd(), path));
    path.split('/').reduce(function (path, pathPart) {
        path = path + '/' + pathPart;
        if (!Fs.existsSync(path)) {
            Fs.mkdirSync(path);
        }
        return path;
    }, '');
}

paths.forEach(function (pathObj) {
    var pathToDir = Path.dirname(pathObj.link);
    var success;

    mkdirPSync(pathToDir);
    success = pathObj.files.some(function (file) {
        var stat;

        try {
            stat = Fs.statSync(file);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            } else {
                throw err;
            }
        }

        try {
            Fs.symlinkSync(Path.relative(pathToDir, file), pathObj.link);
        } catch (err) {
            if (err.code !== 'EEXIST') {
                throw err;
            }
        }

        return stat;
    });

    if (!success) {
        console.error('bem-node package can\'t find dependency for ' + pathObj.link);
        process.exit(1);
    }
});
