/**
 * This block allows to proxy static files through node and open @link and include directives
 */
(function () {
    var fs = require('fs'),
        dirname = require('path').dirname,
        resolve = require('path').resolve,
        borschik = require('borschik').api,
        CONTENT_TYPES = {
            'css': 'text/css;charset=utf-8',
            'js': 'application/x-javascript;charset=utf-8',
            'png': 'image/png',
            'gif': 'image/gif',
            'jpg': 'image/jpg',
            'svg': 'image/svg+xml',
            'ico': 'image/x-icon',
            'ttf': 'application/x-font-ttf',
            'otf': 'application/x-font-opentype',
            'woff': 'application/x-font-woff',
            'eot': 'application/vnd.ms-fontobject',
            'txt': 'text/plain',
            'html': 'text/html',
            'json': 'application/json'
        },
        route = new RegExp('^.*\\.(' + Object.keys(CONTENT_TYPES).join('|') + ')$');

    BEM.blocks['i-router'].define('GET', route, 'i-ycssjs');
    BEM.decl({block: 'i-ycssjs'}, null, {

        init: function (matches, req, res) {
            var path = '.' + matches[0],
                suffix = matches[1];

            if (suffix === 'css' || suffix === 'js') {
                path = path.replace(/\/_([\w\.]+$)/, '$1');
            }

            fs.stat(path, function (err, stat) {

                if (err || !stat.isFile()) {
                    res.statusCode = 503;
                    res.end('Not file');
                    return;
                }

                res.setHeader('Content-Type', CONTENT_TYPES[suffix]);

                if (suffix === 'css') {

                    borschik({
                        input: path,
                        output: res,
                        tech: 'css',
                        minimize: false,
                        freeze: false
                    }).then(null, function (e) {
                        res.statusCode = 503;
                        console.log(e.stack);
                        res.end(String(e));
                    }).done();

                } else {

                    fs.readFile(path, function (err, source) {
                        var result = source;

                        if (err) {
                            res.writeHead(404);
                            return res.end();
                        }

                        if (suffix === 'js') {
                            result = expandContent(source, path);
                        }

                        res.end(result);

                    });
                }
            });

            return Vow.fulfill();
        }

    });

    function expandContent(content, rootPath) {
        return content.toString().replace(/include\(['"](.+)['"]\);?/g, function (p, p1) {
            var path = resolve(dirname(rootPath), p1);

            try {
                return [
                    '/* start: ' + path + '*/\n',
                    expandContent(fs.readFileSync(path, 'utf8'), path),
                    '/* end: ' + path + '*/\n\n'
                ].join('');
            } catch (e) {
                console.log(e.message);
                return e.stack;
            }
        });
    }
}());
