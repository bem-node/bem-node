var INHERIT = require('inherit'),
    BaseTech = require('./tech.js').Tech;

exports.Tech = INHERIT(BaseTech, {

    getBuildResultChunk: function (relPath, path) {
        return 'include("' + relPath + '");\n';
    },

    appendBefore: function () {
        return ['bemhtml'];
    },

    getSuffixes: function () {
        return ['common.js', 'js'];
    }


});
