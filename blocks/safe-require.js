/**
 * пробуем подключить файлик из node_modules проекта или на уровень выше
 */
var Path = require('path');

module.exports = function (incomingPaths, cb) {
    var paths = incomingPaths.reduce(function (result, path) {
        result.push(Path.normalize(Path.join(__dirname, '../node_modules', path)));
        result.push(Path.normalize(Path.join(__dirname, '../../../node_modules', path)));
        return result;
    }, []);
    var required = paths.some(function (modulePath) {
        try {
            require(modulePath);
            return true;
        } catch (e) {
            return false;
        }
    });

    if (!required) {
        if (cb) {
            return cb();
        }

        throw new Error('bem-node can\'t find some of deps - ' + paths);
    }
};
