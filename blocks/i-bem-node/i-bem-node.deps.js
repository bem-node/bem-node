({
    mustDeps: [
        {block: 'i-bem', elems: ['dom']},
        {block: 'i-router', mods: {init: 'auto'}},
        {block: 'i-content', mods: {type: 'bh'}},
        {block: 'i-bh'}
    ],
    shouldDeps: [
        {block: 'i-page'},
        {block: 'i-api-request'},
        {block: 'i-ajax-proxy'}
    ]
})