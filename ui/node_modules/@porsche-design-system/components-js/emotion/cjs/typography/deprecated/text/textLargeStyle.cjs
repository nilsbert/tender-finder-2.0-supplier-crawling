'use strict';

var fontSizeTextLarge = require('../../../font/deprecated/fontSizeTextLarge.cjs');
var textShared = require('./textShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextLg instead. */
const textLargeStyle = {
    font: `${textShared._textFontPartA}${fontSizeTextLarge.fontSizeTextLarge}${textShared._textFontPartB}`,
};

exports.textLargeStyle = textLargeStyle;
