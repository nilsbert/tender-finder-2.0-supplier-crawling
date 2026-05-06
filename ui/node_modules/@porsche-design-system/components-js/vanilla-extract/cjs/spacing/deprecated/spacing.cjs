'use strict';

var spacingFluid = require('./spacingFluid.cjs');
var spacingStatic = require('./spacingStatic.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use spacing variables directly instead. */
const spacing = {
    static: spacingStatic.spacingStatic,
    fluid: spacingFluid.spacingFluid,
};

exports.spacing = spacing;
