'use strict';

var fontSizeHeadingLarge = require('./fontSizeHeadingLarge.cjs');
var fontSizeHeadingMedium = require('./fontSizeHeadingMedium.cjs');
var fontSizeHeadingSmall = require('./fontSizeHeadingSmall.cjs');
var fontSizeHeadingXLarge = require('./fontSizeHeadingXLarge.cjs');
var fontSizeHeadingXXLarge = require('./fontSizeHeadingXXLarge.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use typescale variables instead. */
const fontSizeHeading = {
    small: fontSizeHeadingSmall.fontSizeHeadingSmall,
    medium: fontSizeHeadingMedium.fontSizeHeadingMedium,
    large: fontSizeHeadingLarge.fontSizeHeadingLarge,
    xLarge: fontSizeHeadingXLarge.fontSizeHeadingXLarge,
    xxLarge: fontSizeHeadingXXLarge.fontSizeHeadingXXLarge,
};

exports.fontSizeHeading = fontSizeHeading;
