#!/usr/bin/env node
var args = process.argv.slice(2),
    bemNodeFolder = require.resolve('bem-node'),
    emptyApp = bemNodeFolder.replace(/[^\/]+$/, 'lib/empty-app'),
    ncp = require('ncp').ncp,
    fs = require('fs'),
    cwd = process.cwd(),
    optionRegExp = /^\-{1,2}/,
    options = {
        page: 'index',
        rebuild: 'bem make',
        port: 3000
    },
    i, option;

for (i = 0; i < args.length; i++) {
    if (optionRegExp.test(args[i])) {
        option = args[i].replace(optionRegExp, '');
        if (typeof options[option] === 'boolean') {
            options[option] = true; 
            args.splice(i, 1);
            i--;
        } else {

            options[option] = args[i + 1];
            if (!isNaN(Number(options[option]))) {
                options[option] = Number(options[option]);
            }

            args.splice(i, 2);
            i -= 2;
        }
    }
}

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
                console.log('Done. Now run:');
                console.log('$ cd', name, '&& npm install');   
            }
        );
    });
}

function runApp() {
    var develop = require('../lib/develop');
    develop.start({
        watcherFolders: ['blocks'],
        rebuildCommand: options.rebuild,
        runPort: options.port,
        appPort: options.port + 1,
        runCommand: 'node ' + options.folder + '/' + options.page + '/' + options.page + '.server.js --socket ' + (options.port + 1),
        restartFileMatch: /(common|priv|server)\.js$/,
        rebuildFileMatch: /deps\.js/
    });
}


function run() {
    if (options.folder) {
        return runApp();
    }
    fs.readdir(cwd, function (err, dirs) {
        var pagesFolder;

        if (err) {
            return console.error(err);
        }

        pagesFolder = dirs.filter(function (dirName) {
            return /pages/.test(dirName);
        })[0];
        
        if (!pagesFolder) {
            return console.error('move into bem-node project folder');
        }

        options.folder = pagesFolder;
        runApp();
    });
}

if (!args[0]) {
    return run();
}

switch(args[0]) {
    case 'create':
        createApp(args[1], args[2]);
        break;
    
    default:
        console.error('Method "' + args[0] + '" is not supported');
}
