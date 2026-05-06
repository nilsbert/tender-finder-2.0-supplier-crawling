'use strict';

var fontSizeHeadingSmall = require('../../../font/deprecated/fontSizeHeadingSmall.cjs');
var headingShared = require('./headingShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingSm instead. */
const headingSmallStyle = {
    font: `${headingShared._headingFontPartA}${fontSizeHeadingSmall.fontSizeHeadingSmall}${headingShared._headingFontPartB}`,
};

exports.headingSmallStyle = headingSmallStyle;
