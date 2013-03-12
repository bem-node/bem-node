/**
 * @mustDeps i-bem, i-router, i-command
 */
BEM.decl('i-server', null, {

    /**
     * Starts HTTP server and loads priv.js
     */
    init: function () {
        var cluster = require('cluster'),
            socket = this.getCommandArg('socket');

        if (!socket) {
            console.error('Socket not specified');
            return 1;
        }

        this.__base();

        if (cluster.isMaster) {
            this.prepairSocket(socket);
        } else {
            this._startHTTP();
            require(process.argv[1].replace('server.js', 'priv.js'));
        }
    },

    _startHTTP: function () {
        var http = require('http'),
            _this = this,
            router = BEM.blocks['i-router'],
            httpServer = http.createServer(router.onRequest.bind(router)),
            socket = this.getCommandArg('socket');

        httpServer.listen(socket);
        //handling uncaught exception
        process.on('uncaughtException', function (err) {
            if (err.stack) {
                console.error('UNCAUGHT EXCEPTION:', err.stack);
            } else {
                console.error('UNCAUGHT EXCEPTION:', err);
            }
            //gracefull exit
            httpServer.close(function () {
                process.exit(1);
            });
            //exit anyway after 2s
            setTimeout(function () {
                process.exit(1);
            }, 2000);
        }.bind(this));
    },

    /**
     * Handle server request
     *
     * @param {Object} params
     * @param {http.ServerRequest} params.req
     * @param {http.ServerResponse} params.res
     */
    _requestHandler: function (params) {
        throw new Error('Method [_requestHandler] must be set.');
    },

    /**
     * Get request handler
     *
     * @return {Function}
     */
    _getRequestHandler: function () {
        return this._requestHandler;
    },

    /**
     * Assign request handler
     *
     * @param {Function} handler
     */
    setRequestHandler: function (handler) {
        this._requestHandler = handler;
    },

    /**
     * Socket routine
     *
     * @param {String} socket File name
     */
    prepairSocket: function (socket) {
        var fs = require('fs'),
            cluster = require('cluster');

        try {
            fs.unlinkSync(socket);
        } catch (err) {}
        if (cluster) {
            cluster.on('listening', function (worker, address) {
                console.log('A worker is now connected to ' + address.address);
                fs.chmod(socket, '777');
            });
        }
    }

});
