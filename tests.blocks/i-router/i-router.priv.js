var http = require('http'),
    end = http.ServerResponse.prototype.end;

BEM.decl('i-router', null, {
    _onRequest: function (req, res) {
        res.end = function () {
            var key = Math.random() + '.' + Date.now();
            env.states[key] = process.domain.state;

            try {
                res.setHeader('c-node-state-key', key);
            } catch (e) {}

            return end.apply(res, arguments);
        }
        return this.__base(req, res);
    }
});
BEM.blocks['i-router'].init();
