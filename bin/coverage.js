#!/usr/local/bin/node
var Mocha = require('mocha'),
    blanket = require('blanket'),
    exec = require('child_process').exec,
    path = require('path'),
    mochaPhantomJS = path.join(__dirname + '/../node_modules/.bin/mocha-phantomjs'),
    server = path.join(__dirname + '/../tests/debounce/debounce.server.js'),
    tests = new Mocha();

blanket({
    pattern: /\/blocks\/.*\/[^\/\.]+\.(common\.js|priv\.js|js)$/
});

/*console.log(server);*/
/*console.log(mochaPhantomJS + ' http://127.0.0.1:3000');*/
/*require(server);*/
/*setTimeout(function () {*/
/*console.log(path.join(__dirname + '/../tests.sh'))*/
var t = path.join(__dirname + '/../tests.sh');
exec('bash ' + t + ' -c', function (err, stdout, stderr) {
    console.log(1);
    console.log(arguments);
})
    .on('error', function (e) {
        console.log(e);
    })
console.log(1)

return;
tests
    .addFile(__dirname + '/../tests/debounce/debounce.server.tests.js')
    .reporter('html-cov')
    .ui('bdd')
    .run()
    .on('end', process.exit);



/*require(__dirname + '/../tests/debounce/debounce.server.tests.js');*/
    /*require(__dirname + '/../tests/simple/simple.server.tests.js');*/
/*exec(__dirname + '/../node_modules/.bin/mocha-phantom tests/simple/simple.tests.js', function () {*/
/*console.log(arguments);*/
/*});*/
