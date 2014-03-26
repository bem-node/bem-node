#!/usr/local/bin/node
var Mocha = require('mocha'),
    tests = new Mocha();

tests
    .addFile(__dirname + '/../tests/simple/simple.server.tests.js')
    .reporter('blanket')
    .ui('html-cov')
    .run()
    .on('test end', function (test) {
        console.log(test);
    })

/*console.log(mocha);*/
/*require('../tests/simple/simple.server.tests.js');*/
