var cwd = process.cwd();

MAKE.decl('Arch', {

    getBundlesLevels: function() {
        return [
            cwd + '/pages'
        ];
    }

});

MAKE.decl('BundleNode', {

    getTechs: function() {

        return [
            'bemdecl.js',
            'deps.js',
            'bemhtml',
            'css',
            'js',
            'priv.js',
            'server.js'
        ];
    }

});
