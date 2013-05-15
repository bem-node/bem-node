/**
 * This block allows to proxy static files through node and open @link and include directives
 */
(function () {
    var fs = require('fs'),
        normalize = require('path').normalize,
        borschik = require('borschik').api,
        CONTENT_TYPES = {
            'css': 'text/css',
            'js': 'application/x-javascript',
            'png': 'image/png',
            'gif': 'image/gif',
            'jpg': 'image/jpg'
        },
        route = new RegExp('^.*\\.(' + Object.keys(CONTENT_TYPES).join('|') + ')$');

    BEM.blocks['i-router'].define('GET', route, 'i-ycssjs');
    BEM.decl({block: 'i-ycssjs'}, null, {
        
        init: function (matches, req, res) {
            var path = '.' + matches[0],
                suffix = matches[1],
                fileDir = path.replace(/[^\/]+$/, '');

            if (suffix === 'css' || suffix === 'js') {
                path = path.replace(/_([\w\.]+$)/, '$1');
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
                            result = result.toString().replace(/include\(['"](.+)['"]\);?/g, function (p, p1) {
                                var path = p1[0] === '/' ? p1 : (fileDir + p1);
                                path = normalize(path);
                                try {
                                    return [
                                        '/* start: ' + path + '*/\n',
                                        fs.readFileSync(path, 'utf8'),
                                        '/* end: ' + path + '*/\n\n'
                                    ].join('');
                                } catch (e) {
                                    console.log(e.message);
                                    return e.stack;
                                }
                            });
                        }

                        res.end(result);

                    });
                }
            });

            return Vow.fulfill();
        }

    });
}());
