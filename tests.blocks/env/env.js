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
 * @param {Boolean} [useRouter = false] user .setPath() router method 
 *
 * @return {Vow.promise}
 */
env = function (url, fn, useRouter) {
    var result, lastUrl;

    if (!fn) {
        fn = url;
        url = null;
    }
    if (url) {
        lastUrl = window.location.href;

        try {
            if (useRouter) {
                BEM.blocks['i-router'].setPath(url);
            } else {
                history.pushState(null, null, url);
                BEM.blocks['i-router']._prepearRoute();
            }
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
            BEM.blocks['i-router']._prepearRoute();
        }
        return p;
    });

};
