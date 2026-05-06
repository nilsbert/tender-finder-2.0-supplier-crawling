'use strict';

var fontSizeHeadingLarge = require('../../../font/deprecated/fontSizeHeadingLarge.cjs');
var headingShared = require('./headingShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingLg instead. */
const headingLargeStyle = {
    font: `${headingShared._headingFontPartA}${fontSizeHeadingLarge.fontSizeHeadingLarge}${headingShared._headingFontPartB}`,
};

exports.headingLargeStyle = headingLargeStyle;
