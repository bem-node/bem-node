0.9.0
---------------

 * `i-enb` middleware replaced `i-ycssjs`

Now ` .bem/enb-make.js` config applies to static proxy.
You can disable static proxy with `--no-static-proxy` option.

* `i-errors` for user errors

Create custom errors
```js
var Errors = BEM.blocks['i-errors'];
var ApiError = function (status, debugInfo) {
  HttpError.call(this, status);
  this.name = 'ApiError';
  this.debugInfo = debugInfo;
}
ApiError.prototype = new HttpError();
ApiError.prototype.constructor = ApiError;

var err = new ApiError(404, 'fail');
Errors.isHttpError(err);//true
err instanceof Error; //true
err.debugInfo; //fail

```

Serialize and deserialize errors in json
```js
//node
var Errors = BEM.blocks['i-errors'];
BEM.blocks['i-response'].json({
  error: Errors.serialize(new Errors.HttpError(404))
});
```
```js
//browser
var Errors = BEM.blocks['i-errors'];
var data = JSON.parse(xhr.responseText);
var err = Errors.createError(data.error);
Errors.isHttpError(err);//true
```

* `i-errors.isHttpError` instead of `i-api-request.isHttpError`


* Magic `.init` in BN

```js
//example of static header that updates when page changing
BN.addDecl('app-header').instanceProp({
    //fires when block inits on client
    //no need to add ctx.js(true) to template manually
    init: function () {
        BN('i-router').on('update', this._onPageUpdate); //listen to page updates
    },
    _onPageUpdate: function () {
        this.elem('search-input').val( //change value of search input element
            BN.escapeHTML( //escape to prevent XSS
                BN('i-router').getParams().q //get param from url
            )
        );
    }
});
```





0.8.0
---------------
new interface for ```_decodeBody``` method in ```i-api-request```

was
```
     @param {Object} res Response
     @param {String|Buffer} body
     @param {Function} callback
```

now
```
     @param {Object} res Response
     @param {String|Buffer} body
     @returns {Vow.promise}
```
0.7.19
---------------
* added ```BEM.blocks['i-router'].getMatchers()```

0.7.10
---------------
* pass lastPath to page update handler

0.7.0
---------------
* ```BEM.blocks['i-router'].excapeHTML()``` now is depreaceted. Use ```BEM.blocks['i-content'].excapeHTML()```
* ```BEM.blocks['i-router'].get()``` now is deprecated. Use ```BEM.blocks['i-router'].getPath() | getUri() | getRes() | getReq() | getParams()``` instead

* method ```beforeOut``` now deprecated. If you need make something before rendering you shold make it in ```init``` method.

instad of:
```js
BN('i-page').beforeOut(function () {
    return BN('some-block').someCheck();
});

BN.addDecl('hello-world', 'page', {
    route: /^\/$/
}).staticProp({
    init: function () {
        return this.out('hello world');
    }
});
```
you should write:
```js
BN.addDecl('hello-world', 'page', {
    route: /^\/$/
}).staticProp({
    init: function () {
        var _this = this;
        return BN('some-block').someCheck().then(function () {
            return _this.out({block: 'some-block'})
        });
    }
});
```
