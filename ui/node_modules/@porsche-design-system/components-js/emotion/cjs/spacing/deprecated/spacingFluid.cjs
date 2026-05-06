'use strict';

var spacingFluidLarge = require('./spacingFluidLarge.cjs');
var spacingFluidMedium = require('./spacingFluidMedium.cjs');
var spacingFluidSmall = require('./spacingFluidSmall.cjs');
var spacingFluidXLarge = require('./spacingFluidXLarge.cjs');
var spacingFluidXSmall = require('./spacingFluidXSmall.cjs');
var spacingFluidXXLarge = require('./spacingFluidXXLarge.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use spacing variables directly instead. */
const spacingFluid = {
    xSmall: spacingFluidXSmall.spacingFluidXSmall,
    small: spacingFluidSmall.spacingFluidSmall,
    medium: spacingFluidMedium.spacingFluidMedium,
    large: spacingFluidLarge.spacingFluidLarge,
    xLarge: spacingFluidXLarge.spacingFluidXLarge,
    xxLarge: spacingFluidXXLarge.spacingFluidXXLarge,
};

exports.spacingFluid = spacingFluid;
