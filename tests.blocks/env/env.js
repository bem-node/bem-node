/**
 * Creating page context
 *
 * @ex
 *   env('/foo?bar=baz', function () {
 *       BEM.blocks['i-router'].getParams() // {bar: 'baz'}
 *   });
 *
 * @param {String} [url]
 * @param {Function} fn that will execute in page contex
 *
 * @return {Vow.promise}
 */
env = function (url, fn) {
    if (!fn) {
        fn = url;
        url = null;
    }
    if (url) {
        history.pushState(null, null, url);
        BEM.blocks['i-router']._prepearRoute();
    }
    return Vow.promise(fn()); 
};
