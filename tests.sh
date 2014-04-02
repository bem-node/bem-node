#!/bin/bash
MOCHA='./node_modules/.bin/mocha -R spec'
PHANTOM='./node_modules/.bin/mocha-phantomjs http://127.0.0.1:3000/'
ENB=./node_modules/.bin/enb
JSHINT=./node_modules/.bin/jshint
RUN_CLIENT=
RUN_SERVER=
RUN_LINT=
TEST_NAME=

function kn {
    killall node 2>/dev/null
}
function client {
    echo Client tests
    if [ $1 ]; then
        kn
        node tests/$1/$1.server.js & $PHANTOM
        kn
    else
        for D in `find tests/*/*server.js -type f`; do
            echo "  Testing $D"
            kn
            node $D & $PHANTOM
            kn
        done
    fi;
}
function server {
    echo Server tests
    if [ $1 ]; then
        kn
        $MOCHA tests/$1/$1.server.tests.js
        kn
    else
        for D in `find tests/*/*server.tests.js -type f`; do
            echo "  Testing $D"
            kn
            $MOCHA $D
            kn
        done
    fi
}

function coverage {
    for D in `find tests/*/*server.tests.js -type f`; do
        killall node 2>/dev/null
        $MOCHA -R html-cov --require blanket $D > coverage.html
        echo $ open coverage.html
    done
}

function lint {
    find blocks tests.blocks -type f | grep -vEe 'deps.js' | xargs $JSHINT 1>&2
}

if [ $1 ]; then
    while test $# -gt 0; do
        case "$1" in
            -n|--name)
                if [[ $2 =~ ^[a-z]+$ ]]; then
                    TEST_NAME=$2;
                else
                    echo "Use: -n <name-of-test>"
                fi;
                shift;
                ;;
            --coverage)
                coverage
                ;;
            -l|--lint|--jslint)
                #lint;
                RUN_LINT=true;
                ;;
            -c|--client)
                #client
                RUN_CLIENT=true;
                ;;
            -s|--server)
                RUN_SERVER=true;
                #server
                ;;
            -b|--build)
                RUN_MAKE=true;
                ;;
            *)
                echo Unknown option: "$1"
                echo "Use: -c (--client) -s (--server) -b (--build)"
                ;;
        esac;
        shift;
    done;
else
    RUN_LINT=true
    RUN_CLIENT=true
    RUN_SERVER=true
    RUN_MAKE=true
fi;


if [ $RUN_LINT ]; then
    lint;
fi;
if [ $RUN_MAKE ]; then
    $ENB make;
fi;
if [ $RUN_CLIENT ]; then
    client $TEST_NAME
fi;
if [ $RUN_SERVER ]; then
    server $TEST_NAME
fi;
