'use strict';

var fontSizeTextXSmall = require('../../../font/deprecated/fontSizeTextXSmall.cjs');
var textShared = require('./textShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextXs instead. */
const textXSmallStyle = {
    font: `${textShared._textFontPartA}${fontSizeTextXSmall.fontSizeTextXSmall}${textShared._textFontPartB}`,
};

exports.textXSmallStyle = textXSmallStyle;
