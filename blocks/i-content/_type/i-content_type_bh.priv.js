/*global BEMHTML:true*/
var base = BEM.blocks['i-command'].getRunningFile().replace('server.js', '');

['bemhtml.js', 'bemhtml'].some(function (suffix) {
    try {
        BEMHTML = require(base + suffix).BEMHTML;
        return true;
    } catch (e) {
        return false;
    }
});
