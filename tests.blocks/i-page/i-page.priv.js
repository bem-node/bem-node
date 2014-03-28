/*global expect:true, chai:true, mocha, mochaPhantomJS*/
var fs = require('fs'),
    coverage = BEM.blocks['i-command'].get('coverage') || false;

function script(url, content) {
    var tag = {
        tag: 'script',
    };
    if (url) {
        tag.attrs = {src: url};
    } else if (content) {
        tag.content = '(' + content.toString() + '());';
    }
    return tag;
}

function getTestName() {
    return process.argv[1].match(/\/(\w+)[^\/]+$/)[1];
}

BEM.decl('i-page', null, {
    getPageJson: function (json) {
        var testName = getTestName(),
            testPrefix = '/tests/' + testName + '/' + testName,
            clientJs = coverage && fs.readFileSync('.' + testPrefix + '.js', 'utf8')
                .split('\n')
                .map(function (line) {
                    var m = line.match(/include\('(.*)'\)/);
                    return m && m[1];
                })
                .filter(Boolean)
                .map(function (url) {
                    return script(url);
                });
        return {
            tag: 'html',
            content: [
                {
                    tag: 'head',
                    content: [
                        {
                            tag: 'link',
                            attrs: {
                                rel: 'stylesheet',
                                href: testPrefix + '.css'
                            }
                        }
                    ]
                },
                {
                    tag: 'body',
                    content: [
                        {
                            block: 'b-content',
                            content: json
                        },
                        {
                            attrs: {
                                id: 'mocha'
                            }
                        },
                        script('http://yandex.st/jquery/1.8.3/jquery.min.js'),
                        coverage ? clientJs : script(testPrefix + '.js'),
                        script(null, function () {
                            mocha.ui('bdd');
                            mocha.reporter('html');
                            expect = chai.expect;
                        }),
                        !coverage && script(testPrefix + '.client.tests.js'),
                        coverage && '<script src="https://rawgithub.com/alex-seville/blanket/master/dist/qunit/blanket.min.js"' +
                            'data-cover-adapter="https://rawgithub.com/alex-seville/blanket/master/src/adapters/mocha-blanket.js"' +
                            'data-cover-only="//blocks\/.*/"' +
                        '</script>',
                        script(null, function () {
                            if (window.mochaPhantomJS) { mochaPhantomJS.run(); }
                            else { mocha.run(); }
                        })
                    ]
                }
            ]
        };
    }
});

BEM.blocks['i-router'].define('GET', '/', 'i-page');
