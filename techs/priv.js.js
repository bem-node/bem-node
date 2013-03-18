var INHERIT = require('inherit'),
    BaseTech = require('./tech.js').Tech;

exports.Tech = INHERIT(BaseTech, {

    getBuildResultChunk: function (relPath, path) {
        return (relPath.indexOf('bemhtml') !== -1) ?
            'BEMHTML = require(\'./' + relPath + '\').BEMHTML;\n' : 'require("' + relPath + '");\n';
    },

    appendBefore: function () {
        return ['bemhtml'];
    },

    getSuffixes: function () {
        return ['common.js', 'priv.js'];
    }

});
