'use strict';

var blurFrosted = require('../../tokens/dist/esm/blur/blurFrosted.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use backdropFilter: blurFrosted instead  */
const frostedGlassStyle = {
    WebkitBackdropFilter: blurFrosted.blurFrosted,
    backdropFilter: blurFrosted.blurFrosted,
};

exports.frostedGlassStyle = frostedGlassStyle;
