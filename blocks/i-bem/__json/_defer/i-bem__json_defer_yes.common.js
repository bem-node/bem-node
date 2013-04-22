/**
 * Defered declarations (ctx.defer) for BEM.JSON
*/
(function (BEM) {

    var wait = BEM.JSON._ctx.prototype.wait,
        resume = BEM.JSON._ctx.prototype.resume;


    BEM.JSON._ctx.prototype.wait = function () {
        console.error('ctx.wait() is deprecated, use ctx.defer()');
        wait.call(this);
    };

    BEM.JSON._ctx.prototype.resume = function () {
        console.error('ctx.resume() is deprecated, use ctx.defer()');
        resume.call(this);
    };

    /**
     * Continue build after promise fulfills or removes blocks after reject
     *
     * @param {Vow.promise} promise
     * @param {Vow.promise} promise.fulfill to continue with other block declarations
     * @param {Vow.promise} promise.reject to remove block and continue render
     */
    BEM.JSON._ctx.prototype.defer = function (promise) {
        var ctx = this;
        wait.call(ctx);
        promise.fail(function (err) {
            ctx._declErrorHandler(err);
            ctx.remove();
        }).always(function () {
            resume.call(ctx);
        }).done();
    };
}(BEM));
