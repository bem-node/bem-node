var script = process.argv[1],
    base = script.replace('server.js', '');

['bemhtml.js', 'bemhtml'].some(function (suffix) {
    try {
        BEMHTML = require(base + suffix).BEMHTML;
        return true;
    } catch (e) {
        return false;
    }
});
