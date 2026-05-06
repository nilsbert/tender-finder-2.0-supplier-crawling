'use strict';

var breakpoint = require('./breakpoint.cjs');

function getMediaQueryMin(min) {
    return `(min-width:${breakpoint.breakpoint[min]}px)`;
}

exports.getMediaQueryMin = getMediaQueryMin;
