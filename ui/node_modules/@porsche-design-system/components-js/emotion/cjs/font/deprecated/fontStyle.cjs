'use strict';

var fontStyleNormal = require('./fontStyleNormal.cjs');
var fontStyleItalic = require('./fontStyleItalic.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use 'normal' | 'italic' instead. */
const fontStyle = {
    normal: fontStyleNormal.fontStyleNormal,
    italic: fontStyleItalic.fontStyleItalic,
};

exports.fontStyle = fontStyle;
