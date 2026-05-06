'use strict';

var fontSizeHeadingMedium = require('../../../font/deprecated/fontSizeHeadingMedium.cjs');
var headingShared = require('./headingShared.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingMd instead. */
const headingMediumStyle = {
    font: `${headingShared._headingFontPartA}${fontSizeHeadingMedium.fontSizeHeadingMedium}${headingShared._headingFontPartB}`,
};

exports.headingMediumStyle = headingMediumStyle;
