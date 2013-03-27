Tiny framefork for single-page applycations with NodeJS and BEM

Getting Started
---------------

You should have NodeJS >= 0.8, Node Package Manager (npm) and bem tools installed

To install bem tools run following

npm intall -g bem

Creation new project
---------------

next steps will be replaced with one command soon (something like ```bem-node create <app_name>```)

checkout test project

    git clone https://github.com/wtfil/bem-node-test.git app_name

this is test project and you should remove all else blocks

    cd app_name
    rm -rf blocks/*
    
finaly you should install bem-node
    
    git clone https://github.com/wtfil/bem-node.git node_modules/bem-node
    cd node_modules/bem-node && npm install


Creating new page
---------------

create new block

    bem create block -l blocks -t coomon.js -t deps.js i-page-test

note ```i-page-test``` is page name

    open blocks/i-page-test/i-page-test.common.js

add following lines
```
/**
 * Define / url for matching
 */
BEM.blocks['i-router'].define(/^\/?$/, 'i-page-test');

BEM.decl({block: 'i-page-test', baseBlock: 'i-page'}, null, {

    init: function (matchers) {
        return this.out(/* your bemjson or string here */);
    }

});
```

node: every page are inherit base page. Its name ```i-page```. Dont forgot add it to dependencies

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

    vim pages/index/index.bemdecl.js

You can see few rows in ```bem-node``` part. Dont remove its:) User part is your own. Crean it and add
```
    {block: 'i-page-home'}
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



