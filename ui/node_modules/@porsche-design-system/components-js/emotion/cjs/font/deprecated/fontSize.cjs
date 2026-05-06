'use strict';

var fontSizeDisplay = require('./fontSizeDisplay.cjs');
var fontSizeHeading = require('./fontSizeHeading.cjs');
var fontSizeText = require('./fontSizeText.cjs');

// Fluid Type Scale Calculator (https://fluid-type-scale.com) was used to generate a type scale set based on the "golden ratio".
// "Text/Heading": min - base: 16px, screen: 320px, ratio: 1,2 / max - base: 16px, screen: 1760px, ratio: 1,309
// "Display": min - base: 16px, screen: 320px, ratio: 1,2 / max - base: 16px, screen: 1760px, ratio: 1,5
/** @deprecated since v4.0.0, will be removed with next major release. Use typescale variables instead. */
const fontSize = {
    text: fontSizeText.fontSizeText,
    heading: fontSizeHeading.fontSizeHeading,
    display: fontSizeDisplay.fontSizeDisplay,
};

exports.fontSize = fontSize;
