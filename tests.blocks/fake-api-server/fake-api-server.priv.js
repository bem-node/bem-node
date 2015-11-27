var http = require('http'),
    https = require('https'),
    parse = require('url').parse,
    fs = require('fs'),
    httpsOptions = {
        key: fs.readFileSync(__dirname + '/key.pem'),
        cert: fs.readFileSync(__dirname + '/cert.pem')
    };

function createResponse(path, params) {
    var response = {
            handle: path,
            params: params,
            responseId: Math.random() + Date.now(),
            result: {}
        };


    if (path === 'debounced' && params.id) {
        response.result = params.id.split(',').reduce(function (o, id) {
            o[id] = 'result_' + id;
            return o;
        }, {});
    }

    return response;
}


function onRequest(req, res) {
    var url = req.url.replace(/^\/\:\:1/, ''), // TODO report nodejs bug
        p = parse(url, true),
        path = p.pathname ? p.pathname.replace(/^\//, '') : '',
        params = p.query,
        response = JSON.stringify(createResponse(path, params));
    if (path === 'timeout') {
        return setTimeout(res.end.bind(res, response), 600);
    }
    if (path === 'error') {
        res.writeHead(500, {'Content-Type': 'application/json'});
    } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
    }
    res.end(response);
}

http.createServer(onRequest).listen(3001, '127.0.0.1');
https.createServer(httpsOptions, onRequest).listen(3002, '127.0.0.1');
