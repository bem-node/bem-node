/*global mocha, expect:true, chai:true, mochaPhantomJS*/
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
    return process.argv[1].match(/\/([\w\-]+)[^\/]+$/)[1];
}

BEM.decl('i-page', null, {
    getPageJson: function (json) {
        var testName = getTestName(),
            testPrefix = '/tests/' + testName + '/' + testName;
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
                        script(testPrefix + '.js'),
                        script(null, function () {
                            mocha.ui('bdd');
                            mocha.reporter('html');
                            expect = chai.expect;
                        }),
                        script(testPrefix + '.client.tests.js'),
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
