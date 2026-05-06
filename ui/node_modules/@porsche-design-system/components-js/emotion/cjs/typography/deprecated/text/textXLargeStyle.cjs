'use strict';

var fontSizeTextXLarge = require('../../../font/deprecated/fontSizeTextXLarge.cjs');
var textShared = require('./textShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextXl instead. */
const textXLargeStyle = {
    font: `${textShared._textFontPartA}${fontSizeTextXLarge.fontSizeTextXLarge}${textShared._textFontPartB}`,
};

exports.textXLargeStyle = textXLargeStyle;
