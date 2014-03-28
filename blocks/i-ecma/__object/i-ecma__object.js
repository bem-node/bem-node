// http://jsperf.com/new-vs-object-create-including-polyfill
if (typeof Object.create !== 'function') {
    Object.create = function (o, props) {
        var prop;
        function F() {}
        F.prototype = o;

        if (typeof(props) === "object") {
            for (prop in props) {
                if (props.hasOwnProperty((prop))) {
                    F[prop] = props[prop];
                }
            }
        }
        return new F();
    };
}
