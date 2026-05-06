'use strict';

var typescale3Xl = require('../../../font/typescale3Xl.cjs');
var displayShared = require('./displayShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading3XlStyle instead. */
const displaySmallStyle = {
    font: `${displayShared._displayFontPartA}${typescale3Xl.typescale3Xl}${displayShared._displayFontPartB}`,
};

exports.displaySmallStyle = displaySmallStyle;
