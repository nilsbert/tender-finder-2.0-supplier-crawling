'use strict';

var fontSizeTextSmall = require('../../../font/deprecated/fontSizeTextSmall.cjs');
var textShared = require('./textShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextSm instead. */
const textSmallStyle = {
    font: `${textShared._textFontPartA}${fontSizeTextSmall.fontSizeTextSmall}${textShared._textFontPartB}`,
};

exports.textSmallStyle = textSmallStyle;
