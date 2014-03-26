BEM.decl({name: 'i-www-server', baseBlock: 'i-server'}, null, {

    /**
     * Starts HTTP server and loads priv.js
     */
    init: function () {
        var cluster = require('cluster'),
            socket = BEM.blocks['i-command'].get('socket') || 3000,
            workers = Number(BEM.blocks['i-command'].get('workers')),
            isTest = typeof global.describe === 'function' && typeof global.it === 'function',
            priv,
            number;

        number = Number(socket);
        socket = !isNaN(number) ? number : socket;

        this.__base();

        if (cluster.isMaster) {
            this.prepairSocket(socket);
        }
        if (!workers || !cluster.isMaster) {
            this._startHTTP(socket);


            priv = Object.keys(require.cache).filter(function (path) {
                return path.indexOf('server.js') !== -1;
            })[0];
            priv = priv.replace('server.js', 'priv.js');

            require(priv);
        }
    },

    _startHTTP: function (socket) {
        var http = require('http'),
            _this = this,
            httpServer = http.createServer(function (req, res) {
                _this._getRequestHandler()(req, res);
            });

        httpServer.listen(socket);

        //handling uncaught exception
        process.on('uncaughtException', function (err) {
            console.error('UNCAUGHT EXCEPTION:', err.stack);
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
    _requestHandler: function () {
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
            cluster = require('cluster'),
            isNumber = typeof socket === 'number';
        
        if (!isNumber) {
            try {
                fs.unlinkSync(socket);
            } catch (err) {}
        }

        if (cluster) {
            cluster.on('listening', function (worker, address) {
                console.log('A worker is now connected to ' + address.address);
                if (!isNumber) {
                    fs.chmod(socket, '777');
                }
            });
        }
    }

});
