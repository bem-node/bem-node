({
    mustDeps: [
        {block: 'i-router', mods: {init: 'auto'}},
        {block: 'i-content', mods: {type: 'bh'}},
        {block: 'i-bem', elems: ['dom']},
        {block: 'i-bh'}
    ],
    shouldDeps: [
        {block: 'i-page'},
        {block: 'i-ajax'},
        {block: 'i-api-request'},
        {block: 'i-ajax-proxy'}
    ]
})