#!/bin/bash
MOCHA=./node_modules/.bin/mocha
PHANTOM=./node_modules/.bin/mocha-phantomjs
ENB=./node_modules/.bin/enb

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
if [ $1 ]; then
    while test $# -gt 0; do
        case "$1" in
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
    enb make
    server
    client
fi;
