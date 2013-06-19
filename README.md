Tiny framefork for single-page applycations with NodeJS and BEM

[API](https://github.com/wtfil/bem-node/wiki/API)

Getting Started
---------------

You should have NodeJS >= 0.8, Node Package Manager (npm) and bem tools installed

To install bem tools run following

    sudo npm install -g bem

Creation new project
---------------

next steps will be replaced with one command soon (something like ```bem-node create <app_name>```)

checkout test project

    git clone https://github.com/wtfil/bem-node-test.git app_name

this is test project and you should remove all other blocks

    cd app_name
    rm -rf blocks/*
    
finaly you should install bem-node (bem-node already in dependencies)

    npm install


Creating new page
---------------

create new block in the root of project

    bem create block -l blocks -t common.js -t deps.js i-page-test

note: ```i-page-test``` is page name

    open blocks/i-page-test/i-page-test.common.js

add following lines
```
/**
 * Define /\d+ url for matching
 */
BEM.blocks['i-router'].define(/^\/(\d+)?\/?$/, 'i-page-test');

BEM.decl({block: 'i-page-test', baseBlock: 'i-page'}, null, {

    init: function (matchers) {
        return this.out(/* your bemjson or string here */);
    }

});
```
```BEM.blocks['i-router'].define``` function  allows to subscribe url changing

the ```.out```  argument is what you will see as the result.

It can be bemjson or string

```
init: function (matchers) {
    return this.out({
        block: 'b-test-block',
        someParam: matches[1]
    });
}
```
note: in this case dont forget add ```b-test-block``` to dependencies


every page is module with thee mandatory methods

```init``` will calls after url matches first time

```update``` will be called if same url is matching with new matchers (on client-side)

```destruct``` will be called for previous page before update of new page is called.

```update``` and ```destruct``` methods should be defined in ```js``` (not ```common.js```) file

all this methods are return promises and implemented in base block

note: every page is inherit base page. The name is ```i-page```. Dont forget to add it to dependencies

    open blocks/i-page-test/i-page-test.deps.js

and add dependencies
```
({
    mustDeps: [
        {block: 'i-page'}
    ]
})
```

add this page to bemdecl

    open pages/index/index.bemdecl.js

You can see few rows in ```bem-node``` part. Dont remove its:) ``user part``` is your own. Crean it and add
```
{block: 'i-page-test'}
```

API
---------------
subscribe ```i-page-name``` to handle /qwe url

url can be regular expression
```
BEM.blocks['i-router'].define('GET|POST', '/qwe', 'i-page-name')
``` 

set path to '/foo' (redirect on server)
```
BEM.blocks['i-router'].setPath('/foo')
``` 

geting resource from api (retuns promise)
``` 
BEM.blocks['i-api-request'].get('http://nodejs.org/api/index.json')
BEM.blocks['i-api-request'].get('index.json') // if .apiHost sets to "http://nodejs.org/api" on your level
```

Building
---------------
You should run this command in the root of project

after creating / removing of new blocks / files / dependencies

    bem make

or

    bem make --force

if something is going wrong

Run
---------------

after buiding run

    node pages/index/index.server.js --socket 3000

open http://127.0.0.1:3000

Example
---------------
Checkout this test project https://github.com/wtfil/bem-node-test



