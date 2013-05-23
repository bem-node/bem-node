This is the test project that used bem-node

Getting Started
---------------

install bem tools

    sudo npm install -g bem

checkout the project

    git clone https://github.com/wtfil/bem-node-test.git
    cd bem-node-test

install npm dependencies

    npm install

Build project
---------------

You should run this command in the root of project

after creating / removing  of new blocks / files / dependencies

    bem make

or 

    bem make --force

if something is going wrong



Run
---------------

In the root of project

    node pages/index/index.server.js --socket 3000


Open http://127.0.0.1:3000
