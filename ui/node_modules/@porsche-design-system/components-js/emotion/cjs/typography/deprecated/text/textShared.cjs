'use strict';

var fontFamily = require('../../../font/deprecated/fontFamily.cjs');
var fontLineHeight = require('../../../font/deprecated/fontLineHeight.cjs');
var fontStyleNormal = require('../../../font/deprecated/fontStyleNormal.cjs');
var fontVariant = require('../../../font/deprecated/fontVariant.cjs');
var fontWeightRegular = require('../../../font/deprecated/fontWeightRegular.cjs');

const _textFontPartA = `${fontStyleNormal.fontStyleNormal} ${fontVariant.fontVariant} ${fontWeightRegular.fontWeightRegular} `;
const _textFontPartB = `/${fontLineHeight.fontLineHeight} ${fontFamily.fontFamily}`;

exports._textFontPartA = _textFontPartA;
exports._textFontPartB = _textFontPartB;
