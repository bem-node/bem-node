({
    mustDeps: [
        {block: 'i-state'},
        {block: 'i-bem', elem: 'dom'}
    ],
    shouldDeps: [
        {block: 'i-content'},
        {block: 'i-router'},
        {block: 'i-response'},
        {block: 'i-jquery', mods: {dummy: 'yes'}},
        {block: 'b-page'}
    ]
})
