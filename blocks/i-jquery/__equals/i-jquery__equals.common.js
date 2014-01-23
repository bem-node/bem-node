(function ($) {

    $.equals = equals;

    /**
     * Recursively compare two values
     *
     * @param {Mixed} left
     * @param {Mixed} right
     * @returns {Boolean}
     */
    function equals(left, right) {
        var k;

        if (left === right) {
            return true;
        }

        if ((typeof left === 'function' && typeof right === 'function') ||
            (left instanceof Date && right instanceof Date) ||
            (left instanceof RegExp && right instanceof RegExp)) {
            return left.toString() === right.toString();
        }

        if (!(left instanceof Object && right instanceof Object)) {
            return false;
        }

        if (left.constructor !== right.constructor
            || left.prototype !== right.prototype) {
            return false;
        }

        for (k in left) {
            if (left.hasOwnProperty(k) !== right.hasOwnProperty(k)) {
                return false;
            }
        }

        for (k in right) {
            if (left.hasOwnProperty(k) !== right.hasOwnProperty(k)) {
                return false;
            }
        }

        for (k in left) {
            if (left.hasOwnProperty(k)) {
                if (!equals(left[k], right[k])) {
                    return false;
                }
            }
        }

        return true;
    }

}(jQuery));
