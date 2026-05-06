'use strict';

var colorPrimary$1 = require('../../tokens/dist/esm/color/light-dark/foreground/colorPrimary.cjs');

const colorPrimary = `var(--_color-primary, ${colorPrimary$1.colorPrimary})`;

exports.colorPrimary = colorPrimary;
