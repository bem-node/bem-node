/* jshint expr:true */
describe('i-errors', function () {
    var errors = BEM.blocks['i-errors'];
    var CommonError = errors.CommonError;
    var HttpError = errors.HttpError;
    describe('CommonError', function () {
        it('common', function () {
            expect(CommonError).to.be.ok;
        });

        it('instance', function () {
            var error = new CommonError('test');
            expect(error instanceof Error).to.be.true;
            expect(error instanceof CommonError).to.be.true;
            expect(error.name).to.be.equal('CommonError');
            expect(error.message).to.be.equal('test');
        });
    });

    describe('HttpError', function () {


        it('common', function () {
            expect(HttpError).to.be.ok;
        });

        it('instance', function () {
            var error = new HttpError(404);
            expect(error instanceof Error).to.be.true;
            expect(error instanceof CommonError).to.be.true;
            expect(error.name).to.be.equal('HttpError');
            expect(error.status).to.be.equal(404);
            expect(error.message).to.be.equal('Not Found');
        });
    });

    describe('serialize and create', function () {
        it('HttpError', function () {
            var data = JSON.parse(JSON.stringify({
                error: errors.serialize(new HttpError(404))
            }));
            expect(data.error.stack).not.to.be.ok;
            var err = errors.createError(data.error);
            expect(err instanceof Error).to.be.true;
            expect(err instanceof CommonError).to.be.true;
            expect(err.name).to.be.equal('HttpError');
            expect(err.status).to.be.equal(404);
            expect(err.message).to.be.equal('Not Found');
        });
        it('Error', function () {
            var data = JSON.parse(JSON.stringify({
                error: errors.serialize(new Error('test'))
            }));
            expect(data.error.stack).not.to.be.ok;
            var err = errors.createError(data.error);
            expect(err instanceof Error).to.be.true;
            expect(err.message).to.be.equal('test');
        });
        it('runtime error', function () {
            var data;
            try {
                this.a();
            } catch (runtimeErr) {
                data = JSON.parse(JSON.stringify({
                    error: errors.serialize(runtimeErr)
                }));
            }
            var err = errors.createError(data.error);
            expect(data.error.stack).not.to.be.ok;
            expect(err instanceof Error).to.be.true;
            expect(err.message).to.be.ok;
        });

    });

    describe('isHttpError', function () {
        it('true', function () {
            expect(errors.isHttpError(new HttpError())).to.be.true;
            expect(errors.isHttpError(new HttpError(404))).to.be.true;
            expect(errors.isHttpError(new HttpError(404), 404)).to.be.true;
        });
        it('false', function () {
            var err = new Error();
            err.status = 404;
            err.name = 'HttpError';
            err.message = 'Not Found';
            expect(errors.isHttpError(err)).to.be.false;
            expect(errors.isHttpError(new HttpError(), 404)).to.be.false;
            expect(errors.isHttpError(new HttpError(403), 404)).to.be.false;
        });
    });

});
