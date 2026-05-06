'use strict';

var typescale5Xl = require('../../../font/typescale5Xl.cjs');
var displayShared = require('./displayShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading5XlStyle instead. */
const displayLargeStyle = {
    font: `${displayShared._displayFontPartA}${typescale5Xl.typescale5Xl}${displayShared._displayFontPartB}`,
};

exports.displayLargeStyle = displayLargeStyle;
