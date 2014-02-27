({
    mustDeps: [
        {block: 'i-state'},
        {block: 'i-www-server', mods: {init: 'auto'}}
    ],
    shouldDeps: [
        {block: 'i-www-server'},
        {block: 'i-response'}
    ]
})
