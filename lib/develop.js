#!/usr/bin/env node
/**
 * Ussage: ./develop.js
 *      -o --output <filename> to change stdout and stderr
 */

var cwd = process.cwd(),
    http = require('http'),
    fs = require('fs'),
    watch = require('watch'),
    request = require('request'),
    sockFolter = '/tmp/',
    watcherFolders = [
        'blocks-desktop',
        'blocks-common',
        'blocks-data'
    ],
    exec = require('child_process').exec,
    needRestart = false,
    needRebuild = false,
    options,
    skipFileRegExp = /\.(i18n\/[\w\.]+|png|jpg|gif)$/,
    args = {},
    inited = false,
    projectProcess;


process.argv.slice(2).forEach(function (val, key, arr) {
    var reg = /^\-{1,2}(\w+)$/,
        match = val.match(reg);

    if (match) {
        args[match[1]] = ((key === arr.length - 1) || (reg.test(arr[key + 1]))) ? true : arr[key + 1];
    }

});

(function () {
    var stdout = args.o || args.output,
        file;
    if (stdout) {
        file = fs.openSync(stdout, 'a');
        console.error = console.log = function (st) {
            fs.write(file, st + '\n', null, 'utf-8');
        };
    }
}());

var colorLog = (function () {
    var colors = {
        blue: '\033[1;36m',
        red: '\033[1;31m',
        white: '\033[1;0m',
    };

    return function () {
        var colorName = arguments[arguments.length - 1],
            args = [].slice.call(arguments, 0, -1),
            color = colors[colorName];
        
        if (color) {
            args[0] = color + String(args[0]);
            args.push(colors['white']);
        } else {
            args.push(colorName);
        }
        console.log.apply(console, args);
    }    
}());

function restartNode(callback) {
    var onStartError = '',
        next;
    
    colorLog('restarting', 'blue');
    next = function () {
        if (projectProcess) {
            return;
        }
        projectProcess = exec(options.runCommand, function (stderr, stdout) {
            if (stderr) {
                return next();
            }
            // this call when syntax error
            if (!inited) {
                if (projectProcess) {
                    projectProcess.kill();
                    projectProcess = null;
                }
                callback(onStartError);
            }
        });
        projectProcess.stdout.on('data', function (data) {
            if (!inited) {
                inited = true;
                if (callback) {
                    callback();
                }
            }
            console.log(data.replace(/\n$/, ''));
        });

        projectProcess.stderr.on('data', function (err) {
            if (!inited) {
                onStartError += err;
            }
            console.error(err);
        });
    };
    
    inited = false;
    if (projectProcess) {
        projectProcess.kill();
        projectProcess.on('exit', function () {
            projectProcess = null;
            next();
        });
    } else {
        next();
    }

}

function rebuild(callback) {
    colorLog('rebuilding', 'red');
    exec(options.rebuildCommand, callback);
}

function onRefreshPage(callback) {
    if (needRebuild) {
        needRebuild = false;
        rebuild(restartNode.bind(null, callback));
    } else if (needRestart) {
        needRestart = false;
        restartNode(callback);
    } else {
        callback();
    }
}

function onFileChange(fileName, next, prev) {
    if (typeof fileName === 'object' || skipFileRegExp.test(fileName)) {
        return;
    }
    // new of deleted
    if (!prev || next.nlink === 0 || options.rebuildFileMatch.test(fileName)) {
        needRebuild = true;
    }
    if (options.restartFileMatch.test(fileName)) {
        needRestart = true;
    }
}

function getPage(req, host, callback) {
    var params = {
        uri: 'http://' + host + ':' + options.appPort + req.url,
        method: req.method,
        port: options.appPort,
        encoding: null,
        forever: true,
        headers: req.headers
    };

    req.headers.host = req.headers.host.replace(options.runPort, options.appPort);
    request.get(params, function (err, all, html) {
        if (err || [200, 404, 503].indexOf(all.statusCode) === -1) {
            if (err) {
                inited = false;
            }
            return setTimeout(getPage.bind(null, req, host, callback), 100);
        }
        return callback(all, html);
    });
}

function onRequest(req, res) {
    var host = req.headers.host.replace(/\:\d+$/, ''),
        next = function (err) {
            if (err) {
                res.writeHead(200);
                res.end(err);
                return;
            }
            getPage(req, host, function (all, html) {
                res.writeHead(all.statusCode, all.headers);
                res.end(html);
            });
        };
    if (!projectProcess) {
        restartNode(next);
    } else {
        onRefreshPage(next);
    }
}

function start(lparams) {
    options = lparams;
    options.socket = options.socket || 3000;
    http.createServer(onRequest).listen(options.socket);
    options.watcherFolders.forEach(function (folder) {
        watch.watchTree(cwd + '/' + folder, onFileChange);
    });

    process.on('exit', function () {
        if (projectProcess) {
            projectProcess.kill();
        }
    })
}

exports.start = start;
