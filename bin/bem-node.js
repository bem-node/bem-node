#!/usr/bin/env node
var args = process.argv.slice(2),
    bemNodeFolder = require.resolve('bem-node'),
    emptyApp = bemNodeFolder.replace(/[^\/]+$/, 'empty-app'),
    ncp = require('ncp').ncp,
    fs = require('fs'),
    cwd = process.cwd();

function help() {
    console.log('help');
}

function createApp(name, destination) {
    var path = cwd + '/' + name;
    if (!name) {
        return help();
    }
    
    ncp(emptyApp, path, function () {
        var package = require(path + '/package.json');
        package.name = name;
        fs.writeFile(
            path + '/package.json',
            JSON.stringify(package, null, 4),
            function (err) {
                if (err) {
                    throw err;
                }
                console.log('run:');
                console.log('$ cd', name, '&& npm install');   
            }
        );
    });
}

function run() {
    var develop = require('../develop');
    develop.start({
        watcherFolders: ['blocks'],
        rebuildCommand: 'bem make',
        runPort: 3000,
        runCommand: 'node pages/index/index.server.js --socket 3001',
        restartFileMatch: /(common|priv|server)\.js$/,
        rebuildFileMatch: /deps\.js/
    });
}


function test(onSuccess) {
    fs.readFile(cwd + '/pages/index/index.bemdecl.js', function (err) {
        if (err) {
            return console.log('move into bem-node project folder');
        }
        fs.readFile(cwd + '/pages/index/index.server.js', function (err) {
            if (err) {
                return console.log('run "bem make" first');
            }
            onSuccess();
        });
    })
}


switch(args[0]) {
    case 'create':
        createApp(args[1], args[2]);
        break;
    
    default:
        test(run);
}
