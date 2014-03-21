#!/bin/bash
MOCHA=./node_modules/.bin/mocha
PHANTOM=./node_modules/.bin/mocha-phantomjs
ENB=./node_modules/.bin/enb
JSHINT=./node_modules/.bin/jshint

function client {
    echo Client tests
    for D in `find tests/*/*server.js -type f`; do
        echo "  Testing $D"
        killall node
        node $D & $PHANTOM http://127.0.0.1:3000/
    done
}
function server {
    echo Server tests
    for D in `find tests/*/*server.tests.js -type f`; do
        echo "  Testing $D"
        killall node
        $MOCHA -R spec $D
    done
}

function coverage {
    for D in `find tests/*/*server.tests.js -type f`; do
        killall node 2>/dev/null
        $MOCHA -R html-cov --require blanket $D > coverage.html
        echo $ open coverage.html
    done
}

function lint {
    find blocks tests.blocks -type f | grep -vEe 'deps.js' | xargs $JSHINT
}

if [ $1 ]; then
    while test $# -gt 0; do
        case "$1" in
            --coverage)
                coverage
                ;;
            -l|--lint|--jslint)
                lint;
                ;;
            -c|--client)
                client
                ;;
            -s|--server)
                server
                ;;
            -b|--build)
                $ENB make
                ;;
            *)
                echo Unknown option: "$1"
                echo "Use -c (--client) -s (--server) -b (--build)"
                ;;
        esac;
        shift;
    done;
else
    lint
    enb make
    server
    client
fi;
