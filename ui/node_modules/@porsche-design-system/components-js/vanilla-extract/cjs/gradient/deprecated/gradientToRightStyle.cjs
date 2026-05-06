'use strict';

var gradientStopsFadeDark = require('../../tokens/dist/esm/gradient/gradientStopsFadeDark.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. background: `linear-gradient(to right, ${gradientStopsFadeDark});` instead  */
const gradientToRightStyle = {
    background: `linear-gradient(to right, ${gradientStopsFadeDark.gradientStopsFadeDark});`,
};

exports.gradientToRightStyle = gradientToRightStyle;
