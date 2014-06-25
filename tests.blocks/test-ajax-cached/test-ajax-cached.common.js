BEM.decl(
    {name: 'test-ajax-cached', baseBlock: 'i-ajax'},
    null,
    BEM.blocks['i-ajax'].create([
        {name: 'cacheMe'},
        {name: 'cacheMeLittle', timeout: 1}
    ], 'test-ajax-cached')
);
