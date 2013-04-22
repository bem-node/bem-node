if (typeof JSON === 'undefined') {
    window.JSON = {};
}
JSON.parse = JSON.parse || function (json) {
    return eval('(' + json + ')');
};
