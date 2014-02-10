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
