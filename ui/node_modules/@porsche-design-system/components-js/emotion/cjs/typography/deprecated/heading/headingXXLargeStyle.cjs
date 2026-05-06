'use strict';

var fontSizeHeadingXXLarge = require('../../../font/deprecated/fontSizeHeadingXXLarge.cjs');
var headingShared = require('./headingShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading2Xl instead. */
const headingXXLargeStyle = {
    font: `${headingShared._headingFontPartA}${fontSizeHeadingXXLarge.fontSizeHeadingXXLarge}${headingShared._headingFontPartB}`,
};

exports.headingXXLargeStyle = headingXXLargeStyle;
