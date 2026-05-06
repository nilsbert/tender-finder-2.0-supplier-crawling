'use strict';

var typescale4Xl = require('../../../font/typescale4Xl.cjs');
var displayShared = require('./displayShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading4XlStyle instead. */
const displayMediumStyle = {
    font: `${displayShared._displayFontPartA}${typescale4Xl.typescale4Xl}${displayShared._displayFontPartB}`,
};

exports.displayMediumStyle = displayMediumStyle;
