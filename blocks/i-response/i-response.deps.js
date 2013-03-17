({
    mustDeps: [
        {block: 'i-bem', elems: ['i18n']}
    ],
    shouldDeps: [
        {block: 'i-bem', elem: 'json', mods: {async: 'yes', defer: 'yes'}},
        {block: 'i-router'},
        {block: 'i-locale'}
    ]
})
