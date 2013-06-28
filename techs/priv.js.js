var INHERIT = require('inherit'),
    BaseTech = require('./tech.js').Tech;

exports.Tech = INHERIT(BaseTech, {

    getBuildResultChunk: function (relPath, path) {
        relPath = /^\w/.test(relPath) ? ('./' + relPath) : relPath;
        return 'require("' + relPath + '");\n';
    },

    appendBefore: function () {
        return ['bemhtml'];
    },

    getSuffixes: function () {
        return ['common.js', 'priv.js'];
    }

});
