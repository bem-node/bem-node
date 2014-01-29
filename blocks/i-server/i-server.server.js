/**
 * Node server
 * Creates a cluster of http servers
 */
BEM.decl('i-server', null, {
    /**
     * Application entry point
     */
    init: function () {
        var cluster = require('cluster'),
            workers = Number(BEM.blocks['i-command'].get('workers'));

        if (workers && cluster.isMaster) {
            while (workers--) {
                cluster.fork();
            }
            cluster.on('listening', function (worker) {
                worker.on('exit', function () {
                    console.error('Worker ' + worker.process.pid + ' died, forking new one');
                    cluster.fork();
                });
            });
        }
    },
    /**
     * Getting command line arguments
     *
     * @param {String} name
     * @return {String}
     */
    getCommandArg: function (name) {
        var args = process.argv.reduce(function (args, value) {
            var valueAr = value.split('=');
            if (valueAr.length === 2) {
                args[valueAr[0]] = valueAr[1];
            }
            return args;
        }, {});
        this.getCommandArg = function (name) {
            return args[name];
        };
        return this.getCommandArg(name);
    }
});
