/**
 * Add hightlight and firebug style or time on production to console output
 */
var util = require('util'),
    log = console.log.bind(console),
    error = console.error.bind(console),
    cwd = process.cwd(),
    map = [].map,
    mode, message;

try {
    mode = require('configs/log').mode;
} catch (e) {
    log('No config for logs found. Default mode is "development". Add "log.js" file into your configs to change loging mode');
}
mode = mode || 'development';

if (mode === 'production') { // development
    message = function () {
        var path = '';
        try {
            path =  ' in ' + process.domain.state['i-router'].req.url;
        } catch (err) {}
        return '[' + (new Date()).toString() + '] ' + util.format.apply(null, arguments) + path;
    };

    console.log = function () {
        log(message.apply(null, arguments));
    };

    console.error = function () {
        error(String(message.apply(null, arguments)).replace(/[\n\s]+/g, ' '));
        console.log(map.call(arguments, function (e) {
            return e instanceof Error ?
                e.stack : e instanceof Object ?
                    util.inspect(e, null, 1, true) : e;
        }).join(' '));
    };
} else if (mode === 'development') { // development
    message = function (first) {
        var st,
            stack = (new Error()).stack,
            index = stack.match('timeEnd') ? 4 : 3,
            match = stack.split('\n')[index].match(/(\/[\w\/\-\.]+\:\d+)\:\d+/);

        // string like "foo: %s"
        if (typeof first === 'string' && first.match(/%[sdj]/)) {
            st = util.format.apply(null, arguments);
        } else {
            st = [].map.call(arguments, function (arg) {
                if (arg instanceof Error) {
                    return arg.stack;
                }
                return util.inspect(arg, null, 1, true).replace('\\n', '\n');
            }).join(' ');
        }

        if (match) {
            st = '\033[1;36m' + match[1].replace(cwd + '/', '') +
                '\033[0m ' + (st.split('\n').length > 1 ? ('\n' + st) : st);
        }

        return st;
    };

    console.log = function () {
        log('\033[0;32mLog  ', message.apply(null, arguments));
    };

    console.error = function () {
        error('\033[0;31mError', message.apply(null, arguments));
    };
}
