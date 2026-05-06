'use strict';

var fontFamily = require('../../../font/deprecated/fontFamily.cjs');
var fontLineHeight = require('../../../font/deprecated/fontLineHeight.cjs');
var fontStyleNormal = require('../../../font/deprecated/fontStyleNormal.cjs');
var fontVariant = require('../../../font/deprecated/fontVariant.cjs');
var fontWeightRegular = require('../../../font/deprecated/fontWeightRegular.cjs');

const _headingFontPartA = `${fontStyleNormal.fontStyleNormal} ${fontVariant.fontVariant} ${fontWeightRegular.fontWeightRegular} `;
const _headingFontPartB = `/${fontLineHeight.fontLineHeight} ${fontFamily.fontFamily}`;

exports._headingFontPartA = _headingFontPartA;
exports._headingFontPartB = _headingFontPartB;
