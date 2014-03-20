(function () {
    var chai;
    if (!this.chai) {
        try {
            chai = require('chai');
        } catch (e) {
            return;
        }
    }
    this.chai = chai;
    this.expect = chai.expect;
    this.assert = chai.assert;
}(this));
