'use strict';

var fontSizeTextMedium = require('../../../font/deprecated/fontSizeTextMedium.cjs');
var textShared = require('./textShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextMd instead. */
const textMediumStyle = {
    font: `${textShared._textFontPartA}${fontSizeTextMedium.fontSizeTextMedium}${textShared._textFontPartB}`,
};

exports.textMediumStyle = textMediumStyle;
