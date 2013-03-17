(function () {
    var args = (function () {
        var i = 2,
            reg = /^\-{1,2}(\w+)$/,
            args = {},
            argVals = [],
            pushArg = function () {
                if (argName) {
                    args[argName] = argVals.length ? argVals.join(' ') : true;
                }
            },
            argName, val, match;

        for (; i < process.argv.length; i++) {
            val = process.argv[i];
            match = val.match(reg);
            if (match) {
                pushArg();
                argName = match[1];
                argVals = [];
            } else {
                argVals.push(val);
            }
        }
        pushArg();
        return args;
    }());

    BEM.decl('i-command', null, {
        get: function (key) {
            return key ? args[key] : args;
        }
    });
}());

