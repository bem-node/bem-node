BEM.decl(
    {name: 'test-ajax', baseBlock: 'i-ajax'},
    null,
    BEM.blocks['i-ajax'].create([
        'simple',
        'double',
        'pow',
        'allowedButNotExist',
        'getNumber',
        'getString',
        'getArray',
        'getJSON'
    ])
);
