var INHERIT = require('inherit'),
    BaseTech = require('bem/lib/tech').Tech;

exports.Tech = INHERIT(BaseTech, {

    appendBefore: function () {},

    appendAfter: function () {},

    getBuildSuffixes: function () {
        return [this.getTechName()];
    },

    filterPrefixes: function (prefixes) {
        return this.__base(prefixes, this.getSuffixes());  
    },

    getBuildResult: function (prefixes, suffix, outputDir, outputName) {
        var _this = this;
        return _this.__base.apply(_this, arguments)
            .then(function (res) {

                (_this.appendBefore() || []).forEach(function (tech) {
                    res.unshift(_this.getBuildResultChunk(_this.getPath(outputName, tech)));
                });
                (_this.appendAfter() || []).forEach(function (tech) {
                    res.push(_this.getBuildResultChunk(_this.getPath(outputName, tech)));
                });

                return res;
            });
    }

});
