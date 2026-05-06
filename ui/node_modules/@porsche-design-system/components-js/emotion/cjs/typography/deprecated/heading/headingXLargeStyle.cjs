'use strict';

var fontSizeHeadingXLarge = require('../../../font/deprecated/fontSizeHeadingXLarge.cjs');
var headingShared = require('./headingShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingXl instead. */
const headingXLargeStyle = {
    font: `${headingShared._headingFontPartA}${fontSizeHeadingXLarge.fontSizeHeadingXLarge}${headingShared._headingFontPartB}`,
};

exports.headingXLargeStyle = headingXLargeStyle;
