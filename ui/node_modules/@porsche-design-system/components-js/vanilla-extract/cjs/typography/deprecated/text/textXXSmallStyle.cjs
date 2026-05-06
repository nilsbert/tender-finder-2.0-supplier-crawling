'use strict';

var fontSizeTextXXSmall = require('../../../font/deprecated/fontSizeTextXXSmall.cjs');
var textShared = require('./textShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseText2Xs instead. */
const textXXSmallStyle = {
    font: `${textShared._textFontPartA}${fontSizeTextXXSmall.fontSizeTextXXSmall}${textShared._textFontPartB}`,
};

exports.textXXSmallStyle = textXXSmallStyle;
