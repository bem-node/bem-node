({
    mustDeps: [
        {block: 'i-state'},
        {block: 'i-content'}
    ],
    shouldDeps: [
        {block: 'i-router'},
        {block: 'i-response'},
        {block: 'i-jquery', mods: {dummy: 'yes'}},
        {block: 'b-page'}
    ]
})
