'use strict';

var borderRadius = require('./borderRadius.cjs');
var borderWidth = require('./borderWidth.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use variables directly instead. */
const border = {
    radius: borderRadius.borderRadius,
    width: borderWidth.borderWidth,
};

exports.border = border;
