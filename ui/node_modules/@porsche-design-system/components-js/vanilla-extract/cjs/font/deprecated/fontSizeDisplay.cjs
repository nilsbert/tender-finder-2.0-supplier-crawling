'use strict';

var typescale3Xl = require('../typescale3Xl.cjs');
var typescale4Xl = require('../typescale4Xl.cjs');
var typescale5Xl = require('../typescale5Xl.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use variables directly instead. */
const fontSizeDisplay = {
    small: typescale3Xl.typescale3Xl,
    medium: typescale4Xl.typescale4Xl,
    large: typescale5Xl.typescale5Xl,
};

exports.fontSizeDisplay = fontSizeDisplay;
