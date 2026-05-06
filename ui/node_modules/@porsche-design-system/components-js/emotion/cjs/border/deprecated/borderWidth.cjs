'use strict';

var borderWidthBase = require('./borderWidthBase.cjs');
var borderWidthThin = require('./borderWidthThin.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use variables directly instead. */
const borderWidth = {
    base: borderWidthBase.borderWidthBase,
    thin: borderWidthThin.borderWidthThin,
};

exports.borderWidth = borderWidth;
