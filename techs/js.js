var INHERIT = require('inherit'),
    BaseTech = require('bem/lib/tech').Tech;

exports.Tech = INHERIT(BaseTech, {

    getBuildResultChunk: function (relPath, path) {
        return 'include("' + path + '");\n';
    },

    getSuffixes: function () {
        return ['common.js', 'js'];
    },

    getBuildSuffixes: function () {
        return [this.getTechName()];
    },

    filterPrefixes: function (prefixes) {
        return this.__base.call(this, prefixes, this.getSuffixes());  
    }

});
