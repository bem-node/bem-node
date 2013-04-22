(function () {
    var origParse = Date.parse,
        numericKeys = [1, 4, 5, 6, 7, 10, 11];

    /**
     * Returns the number of milliseconds elapsed since 1 January 1970 00:00:00 UTC.
     * @returns {Number} milliseconds
     */
    if (!Date.now) {
        Date.now = function () {
            return new Date().getTime();
        };
    }

    /**
     * Parses a string representation of a date, and returns the number of milliseconds since January 1, 1970, 00:00:00 UTC.
     * This function will be override default parse function, if it don't parse test string as expected
     * @params {String} A string representing an RFC2822 or ISO 8601 date.
     * @returns {Number} milliseconds
     */
    if (!Date.parse || isNaN(Date.parse('2001-02-03T04:05:06.007-06:30'))) {
        Date.parse = function (date) {
            var timestamp, struct, minutesOffset = 0, i, k;
            if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
                for (i = 0; (k = numericKeys[i]); ++i) {
                    struct[k] = +struct[k] || 0;
                }
                struct[2] = (+struct[2] || 1) - 1;
                struct[3] = +struct[3] || 1;
                if (struct[8] !== 'Z' && struct[9] !== undefined) {
                    minutesOffset = struct[10] * 60 + struct[11];
                    if (struct[9] === '+') {
                        minutesOffset = 0 - minutesOffset;
                    }
                }
                timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
            } else {
                timestamp = origParse ? origParse(date) : NaN;
            }
            return timestamp;
        };
    }
})();