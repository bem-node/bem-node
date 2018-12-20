bem-node [![Build Status](https://travis-ci.org/bem-node/bem-node.png?branch=master)](https://travis-ci.org/bem-node/bem-node)
===

Single-page web application with [node.js](http://nodejs.org/api/), [BEM](http://bem.info/)

### Install

Use bem-node with our [project-stub](https://github.com/delfrrr/bem-node-hello-world/)

### How it works

The main principle of bem-node is presenting page layout as bemjson ([russian ref](https://github.com/bem/bemhtml/blob/master/common.docs/reference/reference.ru.md#%D0%A1%D0%B8%D0%BD%D1%82%D0%B0%D0%BA%D1%81%D0%B8%D1%81-bemjson)) object. Block templates apply on bemjson tree to produce complete layout with data. Then bemjson is serialising to html.

![](http://farm6.staticflickr.com/5537/10481480915_dd2ca51aaa.jpg)

### Demo

https://github.com/delfrrr/bem-node-hello-world/commits/demo


### File extensions

#### js

Browser code

#### common.js

Common (client/server) code

#### priv.js

Private (server) code

#### server.js

Builded node.js application (server)


#### bemdecl.js

Application declaration

```js
// application declaration example
exports.blocks = [

    // bem-node part
    {block: 'i-console'}, //colorful console log
    {block: 'i-enb'}, //output static files

    // pages
    {block: 'hello-world'}
];
```

#### deps.js

Block dependencies

```js
//block dependencies example
({
    shouldDeps: [
        {block: 'depended-block'}
    ],
    mustdDeps: [
        {block: 'must-dependeded-block'} //should be included before target block
    ]
})
```

### BN

Block constructor. It creates i-bem ([russian guide](http://ru.bem.info/libs/bem-core/i-bem-js/), [english guide](http://bem.info/articles/bem-js-main-terms/)) blocks with static and dom declarations, and bh [(russian ref)](https://github.com/enb-make/bh) templates.

#### BN(blockName)
 * blockName {String}
 * return {Object} bem block

Returns link on BEM block static methods and properties.

#### BN.addDecl(blockName , [type], [options])
 * blockName {String}
 * [type] {String} - must be "page" or "ajax", if defined
 * [options] {Object}
 * [options.route] {String|RegExp} route for blocks with type="page"
 * [options.apiHost] {String} api host for blocks with type="ajax"
 * return {BN.Generator} bem block generator

Creates block generator.

#### BN.Generator.baseBlock(blockName)
 * returns {BN.Generator}

Inherits block declaration from base block.

#### BN.Generator.staticProp(decl)
 * decl {Object} static methods and properties
 * return {BN.Generator}

Adds static methods and properties ([i-bem](https://github.com/bem-node/i-bem-doc#bem-i-bem-api-reference)).

```js
BN.addDecl('example').staticProp({
    someProp: 'a',
    someMethod: function(){
        return this.someProp + 'b';
    }
}).done();

BN('example').someMethod(); //returns 'ab'

BN.addDecl('example').staticProp({
    someMethod: function(){
        return this.__base() + 'c';
    }
}).done();

BN('example').someMethod(); //returns 'abc'

```

`this` – inherits [i-bem](https://github.com/bem-node/i-bem-doc#bem-i-bem-api-reference)

`this.__instances` – array of block dom instances (only for client side code)

`this.__lastInstance` – last created block instances (only for client side code)

#### BN.Generator.instanceProp(decl)
 * decl {Object} dom instances methods and properties
 * return {BN.Generator}

Adds methods and properties for block dom instance ([i-bem.dom](https://github.com/bem-node/i-bem-doc#bemdom-i-bem__dom-api-reference))

#### BN.Generator.blockTemplate(decl)
 * decl {Object|Function} define block bh template
 * return {BN.Generator}

#### BN.Generator.elemTemplate(decl)
 * decl {Object} define block element bh template
 * return {BN.Generator}

Creates bh templates (see [bh](https://github.com/enb-make/bh)) for block, elements and it's modifications.

```js
/**
 * Example of block with element
 */
BN.addDecl('example').blockTemplate(function (ctx) {
    //block template
    ctx.content([
        {elem: 'item', url: 'item-1', text: 'item 1'},
        {elem: 'item', url: 'item-1', text: 'item 2'}
    ]);
}).elemTemplate({
    'item': function (ctx) {
        //element template
        var json = ctx.json();
        ctx.content({
            block: 'b-link',
            url: json.url,
            content: json.text
        });
    }
});
```

`ctx` is instances of [bh.Ctx]()

#### BN.Generator.dataTemplate(decl)
 * decl {Function} define block data template
 * return {BN.Generator}

`decl` can return promise (see [Vow.promise]()). If promise is fulfilled, other block templates will be applied. If promise is rejected, block will be removed.

```js
BN.addDecl('example').dataTemplate(function(ctx){
    return BN('some-ajax-block').get().then(function(data){
        ctx.param('data', data) //set data to block property
        return Vow.fulfill();
    }).blockTemplate(function(ctx){
        ctx.content(ctx.json().data.text); //ouput data
    });
})
```
`ctx` is instance of [bh.Ctx](https://github.com/enb-make/bh#%D0%9A%D0%BB%D0%B0%D1%81%D1%81-ctx)

#### BN.Generator.done()

Creates i-bem block from generator and adds bh matchers. All blocks will be created automatically on next event loop. Use this methods only to force block creation.


### Page blocks

Page block are controllers for pages.

```js
/**
 * Hello world page
 */
BN.addDecl('hello-world', 'page', {
    route: /^\/$/
}).staticProp({
    init: function () {
        return this.out('hello world');
    }
});
```

All pages are extended from `i-page` block.

```js
BN.addDecl('usual-page', 'page', {
    route: /^\/$/ //page route
}).staticProp({
    init: function (matchers) {
        //...
        return this.out(/*bemjson*/);
    },
    update: function(matchers, prevPath, newPath) {
       //...
       return Vow.fulfill();
    },
    destruct: function() {
       //...
       return Vow.fulfill();
    }
});
```
`route` is {RegExp} or {String} which can be matched to request url.

`init` is called when page route match to request url. Init should return fulfilled promise. Otherwise page returns error.

`update` is called when page should be updated on client (new url matched with the same route). By default `update` calls `init`

`destruct` is called on client side before current page is going to be replaced with other page.

Page blocks are extended from [i-page](#bni-page) block.

### Ajax blocks

Ajax blocks are kind of models (or data blocks). They can provide data to view blocks with common interface between client and server.

On server: get → _request (server implementation) → REST API

On client: get → _request (client implementation) → ajax request → _request (server implementation) → REST API

```js
// example-ajax-block.common.js
BN.addDecl('example-ajax-block', 'ajax', {
    apiHost: 'http://api.example.com/v1/' //json api provider
});
```

```js
//get data from http://api.example.com/v1/some/resource?count=10
BN('example-ajax-block').get('some/resource', {
    params: {
        count: 10
    }
}).then(function(result){
    console.log(result);
});
```
Ajax blocks are inheriting from ['i-api-request'](#bni-api-request) block. You can extend block methods to provide additional input params and output data processing:

```js
/**
 * Fetching data from node.js doc api
 */
BN.addDecl('node-doc-api', 'ajax', {
    apiHost: 'http://nodejs.org/api/'
}).staticProp({
    /**
     * Add .json to resources
     * @overide
     */
    get: function (resource) {
        resource = resource + '.json';
        return this.__base(resource);
    }
});
```

By default ajax blocks have only `GET` method. To provide `POST `PUT` and `DELETE` you should declare them:

```js
// ajax block supporting post
BN.addDecl('example-ajax-block', 'ajax', {
    apiHost: 'http://api.example.com/v1/' //json api provider
}).staticProp({
    post: function (resource, options) {
        return this._request('post', resource, options)
    }
});
```

You are able to extend ajax block to fetch data from any source (like database).

### Existing blocks

Bem-node includes some visual blocks from [bem-bl library](http://bem.github.io/bem-bl/index.en.html)

### Overriding existing blocks

Power of BEM is ability to override almost any method, template or style of block:

```js
//change content of b-page by adding block b-head
BN.addDecl('b-page').blockTemplate(function (ctx) {
    ctx.content([
        {block: 'b-head'},
        ctx.content()
    ], true);
});
```

### BN('i-page')

This is a base block for page blocks. But some of the static methods can be called from other blocks ([issue](https://github.com/wtfil/bem-node/issues/70)).

#### BN('i-page').setTitle(title)
 * title {String}
 * return {Object} this

Setting page `<title/>` on client and on server

#### BN('i-page').setDescription(text)
 * text {String}
 * return {Object} this

Setting page description meta tag on client and on server

#### BN('i-page').setMeta(name, content)
 * name {String} name attribute of `<meta/>`
 * content {String} content attribute of `<meta/>`
 * return {Object} this

Setting page `<meta/>` tags

#### BN('i-page').addToHead(bemjson)
 * bemjson {Object|String}
 * return {Object} this

Adds to page `<head/>` any content

#### .init(matchers)
 * matchers {Array} result of appling route regexp on url
 * return {Vow.promise}

This method is called when page route match to url. Redefine this method to output your page layout. See example in [page blocks](#page-blocks) and [i-page.out method](#bni-pageoutbemjson). By default page outputs empty string.

#### .update(matchers, prevPath, newPath)
 * matchers {Array} result of appling route regexp on url
 * prevPath {String} url path before update
 * newPath {String} new url path
 * return {Vow.promise}

This method is called when page should be updated on client (new url matched with the same route). By default it calls `this.init(). You can setup selective block updates by redefining this method.

```js
/**
 * Node docs page
 */
BN.addDecl('node-doc', 'page', {
    route: /^\/node-doc\/?(.+)?$/
}).staticProp({
    //calls on page render
    init: function (matches) {
        var section = this._getSectionName(matches);
        this.setTitle(section + ' – node.js api'); //set page title
        //output page layout
        return this.out({
            block: 'node-doc',
            content: [
                {elem: 'toc', content: {block: 'node-doc-toc'}},
                {elem: 'section', content: {block: 'node-doc-section', section: section}}
            ]
        });
    },

    _getSectionName: function (matches) {
        return matches[1] || 'documentation'; //set section from url
    },

    //update page on client
    update: function (matches) {
        var section = this._getSectionName(matches);
        return BN('node-doc-section').updateSection(section);
    }
});
```

#### .destruct()
 * return {Vow.promise}

Is called when user leaves page on client and page should be destructed. Extend this method for custom calls on destruct.


#### .out(bemjson)
 * bemjson {Object|String} page content
 * return {Vow.promise}

On server:

* wrap bemjson with static layout (header, footer, etc); you can override static layout by redefining `getPageJson()`; page content should be placed in `i-content` block;
* process bemjson
* serialise bemjson to html
* send http response `200 OK` with resulting html

On client:

* process bemjson
* serialise bemjson to html
* update `i-content` block content with resulting html
* init blocks inside `i-content`

Use it to output page layout from [page blocks](#page-blocks). Do not call `BN('i-page').out(bemjson)`, use only `this.out(bemjson)`


```js
/**
 * Node docs page
 */
BN.addDecl('node-doc', 'page', {
    route: /^\/node-doc\/?(.+)?$/
}).staticProp({
    init: function () {
        return this.out({ //this works on client and server
            block: 'node-doc',
            content: [
                {elem: 'toc', content: {block: 'node-doc-toc'}},
                {elem: 'section', content: {block: 'node-doc-section'}}
            ]
        });
    }
});
```

### BN('i-content')

This block is a container for pages content. Content inside `i-content` can be automatically updated on client.

Block has api to manipulate content inside pages.


#### BN('i-content').html(bemjson, [isSync=false])
 * bemjson {Object|String}
 * [isSync=false] {Boolean}
 * return {Vow.promise|String} rendered html

Applies all supported templates (bh, bem.json, bemhtml) to bemjson tree and then serialises it to html.

By setting `isSync = true` you will get error when rendering blocks with defined `dataTemplate`.

#### BN('i-content').update | replace | append | before(container, bemjson)
 * container {Object} jQuery object
 * bemjson {Object}
 * return {Vow.promise}

Update dom with new content.

```js
BN.addDecl('example').blockTemplate(function(ctx){
    //.. adding some content
}).dataTemplate(function(ctx){
    /.. adding some data to params
}).staticProp({
    updateBlock: function(param) {
        return BN('i-content').update(this.__lastInstance.domElem.parent(), {
            block: this._name,
            param: param
        });
    }
});

```

### BN('i-response')

Manages error pages (404, 50x), http redirect and responses.

#### BN('i-response').send(status, body, [contentType='text/plain'])
 * status {Number} http status
 * body {String}
 * [contentType='text/plain'] {String}

Sends http response.

#### BN('i-response').json(json)

Responses with json.

#### BN('i-response').redirect(path)

Redirects to path with 302 status.

#### BN('i-response').missing()

Responses with 404 status.

#### BN('i-response').error(err)
* err {Error|HttpError} http status

Responses with error (503 or status, defined in HttpError) and log error.

```js
//block sends error when data fetching fails
BN.addDecl('example').dataTemplate(function(ctx){
    var resource = ctx.json().resourceParam; //geting block param
    return BN('ajax-block').get(resource).then(function(dataJson){ //get data from ajax block
        ctx.param('data', dataJson); //setup data in block param
        Vow.fulfill(); //continue render
    }).fail(function(err){ // if data fails
        BN('i-response').error(err); //send error to user
        return Vow.reject(err); // stop render
    });
})
```

### BN('i-errors')

Create user errors

#### new BN('i-errors').CommonError(message)
 * message {String}

Constructor for user errors


#### new BN('i-errors').HttpError(status)
 * status {Number} http status

Https error.

```js
var Errors = BN('i-errors');
var ApiError = function (status, debugInfo) {
  HttpError.call(this, status);
  this.name = 'ApiError';
  this.debugInfo = debugInfo;
}
ApiError.prototype = new HttpError();
ApiError.prototype.constructor = ApiError;

//to properly serialize
Errors.ApiError = ApiError;
ApiError.prototype.serialize = function () {
    var errorObj = HttpError.prototype.serialize.call(this);
    errorObj.args = [this.status, this.debugInfo];
    return errorObj;
}

var err = new ApiError(404, 'fail');
Errors.isHttpError(err);//true
err instanceof Error; //true
err.message; //Not Found
err.debugInfo; //fail

```

#### BN('i-errors').serialize(err)
 * err {Error}

Returns instance of object with error properties. Can be serialised to JSON

#### BN('i-errors').createError(obj)
 * obj {*}

Returns error.

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


### BN('i-router')

Manages page blocks and transitions between urls.

#### BN('i-router').setPath | replacePath(path, [allowFallback=false])
 * path {String}
 * [allowFallback=false] {Boolean} if history.pushState is not supported, reload page to render on server

Changes url path.

On server: redirects with 302.

On client: destructs current page and inits new page. `setPath` uses `history.pushState`; `replacePath` uses `history.replaceState`.

#### BN('i-router').getPath()

Returns url path

#### BN('i-router').getUri()

Returns  full uri (i.e. protocol, domain, path, query)

#### BN('i-router').setParams | replaceParams(params, [allowFallback=false], [extend=false])
 * params {Object} key-value map of url params
 * [allowFallback = false] {Boolean} if history.pushState is not supported, reload page to render on server
 * [extend = false] {Boolean} extend current url params with new one

Changes url params.

On server: redirects with 302.

On client: `setParams` uses `history.pushState`; `replaceParams` uses `history.replaceState`.

#### BN('i-router').getHost()

Returns url host.

#### BN('i-router').escapeHTML | unescapeHTML (html)

 DEPRECATED — use BN('i-content').escapeHTML | unescapeHTML instead

Escapes user content to prevent XSS.

#### BN('i-router').getParams()

GET or POST params.

#### BN('i-router').getReq()

Node [http.IncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage)

#### BN('i-router').getRes()

Node [http.ServerResponse](http://nodejs.org/api/http.html#http_class_http_serverresponse)

#### BN('i-router').getCookies()

Request cookies. See [node-cookie api](https://github.com/defunctzombie/node-cookie);

#### BN('i-router').getMatchers()

Getting regexp matchers from current router

#### Event 'update'

Use it to update static page content on client:

```js
//example of static header that updates when page changing
BN.addDecl('app-header').instanceProp({
    init: function () { //fires when block inits on client
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

### BN('i-api-request')

Base block for ajax blocks.

#### .get(resource, [options])

Calls `this._request('get', resource, options)`;

#### ._request(method, resource, [options])
 * method {string} http method
 * resource {string} REST api resource
 * [options] {Object}
 * [options.params] {Object} REST api request params
 * [options.body] {Object} REST api request body

On server: makes request to rest api host, defined by `this._apiHost`.

On client: makes remote call (through xhr) of server implementation.

#### Event 'beforerequest' 'afterrequest'

Triggered on client before and after xhr request.

```js
BN('i-api-request').on('beforerequest', function () {
    //show ajax loader
});
BN('i-api-request').on('afterrequest', function () {
    //hide ajax loader
});

```

#### Event 'error'

Triggered on client on xhr error.

### Tests

#### run tests

    git clone git@github.com:bem-node/bem-node.git
    cd bem-node
    npm test

#### quick tests

    ./tests.sh -c #client tests only
    ./tests.sh -s #server tests only
    ./tests.sh -s -n simple #run server tests only for 'simple' set
    ./tests.sh -s -n simple -g i-router #grep i-router tests
    ./tests.sh -b #rebuild tests
    ./tests.sh -b -s -c #rebuild, server, client

#### create tests
You should use ```.common.test.js``` for tests common for client and server, ```.priv.tests.js``` for server tests only, and ```.tests.js``` for client tests only.

Typical test looks like this
```js
describe('whatever', function () {
    it ('testing someting', function (done) {
        return expect(env('/some-url?param-name=param-value', function () {
            return <promise or not>
        })).eventually.equal(<some value>)
    });
});
```

```js
describe('i-api-request', function () {
    it('get with full path', function () {
        return expect(env(function () {
            return BEM.blocks['i-api-request'].get('http://nodejs.org/api/index.json')
        })).eventually.have.property('source')
    });
});
```

You should use global ```env``` function to create page context
