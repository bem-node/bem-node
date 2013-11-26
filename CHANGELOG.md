0.7.0
---------------

method ```beforeOut``` now deprecated. I you need make something before rendering you shold make it in ```init``` method.

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
