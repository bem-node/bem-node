var INHERIT = require('inherit'),
    BaseTech = require('./js.js').Tech;

exports.Tech = INHERIT(BaseTech, {

    getBuildResultChunk: function (relPath, path) {
        return 'require("' + path + '");\n';
    },

    getSuffixes: function () {
        return ['common.js', 'priv.js'];
    }

});
