var fs = require('fs');

function findTargets(path) {
    var targets = [],
        files = fs.readdirSync(path);

    files.forEach(function (filename) {
        var fullpath = path + '/' + filename;
        if (/test.js$/.test(filename)) {
            targets.push(filename)
        } else {
            
            if (fs.lstatSync(fullpath).isDirectory()) {
                targets = targets.concat(findTargets(fullpath));
            }
        }
    })

    return targets;
}

function nameToBemjson(name) {
    var match = name.match(/^([a-z\-]+)(?:__([a-z\-]+))?(?:_([a-z\-]+)_([a-z\-]+))?/),
        block = match[1],
        elem = match[2],
        modName = match[3],
        modVal = match[4],
        result = {
            block: block
        },
        mods;
    
    if (elem) {
        result.elem = elem;
    }
    
    if (modName && modVal) {
        mods = {};
        mods[modName] = modVal;
        result[elem ? 'elemMods' : 'mods'] = mods;
    }

    return result;
}

function createPage(target) {
    var block = nameToBemjson(target),
        pageName = target.replace(/\..*/, ''),
        pageDir = 'pages/' + pageName,
        source = 'exports.blocks = ' + JSON.stringify([block], null, 4);

    fs.mkdir(pageDir, function (err) {
        fs.writeFile(pageDir + '/' + pageName + '.bemdecl.js', source);
    })
}

findTargets('blocks')
    .forEach(createPage);

