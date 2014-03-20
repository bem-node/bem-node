/*global env:true*/
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
    var result, lastUrl;

    if (!fn) {
        fn = url;
        url = null;
    }
    if (url) {
        lastUrl = window.location.href;

        try {
            history.pushState(null, null, url);
            BEM.blocks['i-router']._prepearRoute();
        } catch (e) {
            result = Vow.reject(e);
        }
    }

    if (!result) {
        try {
            result = fn();
            result = Vow.promise(result);
        } catch (e) {
            result = Vow.reject(e);
        }
    }

    return result.always(function (p) {
        if (lastUrl) {
            history.pushState(null, null, lastUrl);
        }
        return p;
    });

};
