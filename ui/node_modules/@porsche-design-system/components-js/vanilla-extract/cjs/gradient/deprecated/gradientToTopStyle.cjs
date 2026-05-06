'use strict';

var gradientStopsFadeDark = require('../../tokens/dist/esm/gradient/gradientStopsFadeDark.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. background: `linear-gradient(to top, ${gradientStopsFadeDark});` instead  */
const gradientToTopStyle = {
    background: `linear-gradient(to top, ${gradientStopsFadeDark.gradientStopsFadeDark});`,
};

exports.gradientToTopStyle = gradientToTopStyle;
