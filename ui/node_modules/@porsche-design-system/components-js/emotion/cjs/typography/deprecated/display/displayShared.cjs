'use strict';

var fontFamily = require('../../../font/deprecated/fontFamily.cjs');
var fontLineHeight = require('../../../font/deprecated/fontLineHeight.cjs');
var fontStyleNormal = require('../../../font/deprecated/fontStyleNormal.cjs');
var fontVariant = require('../../../font/deprecated/fontVariant.cjs');
var fontWeightRegular = require('../../../font/deprecated/fontWeightRegular.cjs');

const _displayFontPartA = `${fontStyleNormal.fontStyleNormal} ${fontVariant.fontVariant} ${fontWeightRegular.fontWeightRegular} `;
const _displayFontPartB = `/${fontLineHeight.fontLineHeight} ${fontFamily.fontFamily}`;

exports._displayFontPartA = _displayFontPartA;
exports._displayFontPartB = _displayFontPartB;
