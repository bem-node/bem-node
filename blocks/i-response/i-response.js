/**
 * Manages error pages (404, 50x), reloading current page
 *
 */
BEM.decl('i-response', null, {
    error: function () {
        setTimeout(function () {
            location.reload();
        });
    }
});
