var INHERIT = require('inherit'),
    BaseTech = require('./js.js').Tech;

exports.Tech = INHERIT(BaseTech, {

    getBuildResultChunk: function (relPath, path) {
        return 'require("' + relPath + '");\n';
    },

    getSuffixes: function () {
        return ['server.js'];
    }

});
