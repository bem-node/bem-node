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
    needRestart = true,
    needRebuild = false,
    params,
    /*restartNodeRegExp = /(common|priv|server)\.js$/,*/
    /*depsFileRegExp = /deps\.js$/,*/
    /*skipFileRegExp = /\.(i18n\/[\w\.]+|png|jpg|gif)$/,*/
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


function restartNode(callback) {
    var onStartError = '',
        next;
    
    console.log('>>> restarting');
    next = function () {
        projectProcess = exec(params.runCommand, function (stderr, stdout) {
            // this call when syntax error
            if (!inited) {
                projectProcess.kill();
                projectProcess = null;
                callback(onStartError);
            }
        });
        projectProcess.stdout.on('data', function (data) {
            console.log(inited, data);
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
    console.log('>>> rebuild');
    exec(rebuildCommand, callback);
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
    if (!prev || next.nlink === 0 || depsFileRegExp.test(fileName)) {
        console.log('>>> need rebuild');
        needRebuild = true;
    }
    if (restartNodeRegExp.test(fileName)) {
        console.log('>>> need restart');
        needRestart = true;
    }
}

function getPage(req, host, callback) {
    var params = {
        uri: 'http://proxy.' + host + req.url,
        method: req.method,
        encoding: null,
        forever: true,
        headers: req.headers
    };
    req.headers.host = 'proxy.' + req.headers.host;
    request.get(params, function (err, all, html) {
        if (err || [200, 404, 503].indexOf(all.statusCode) === -1) {
            if (err) {
                console.log('here', err);
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
    params = lparams;
    params.socket = params.socket || 3000;
    http.createServer(onRequest).listen(params.socket);
    params.watcherFolders.forEach(function (folder) {
        watch.watchTree(cwd + '/' + folder, onFileChange);
    });
}

exports.start = start;
