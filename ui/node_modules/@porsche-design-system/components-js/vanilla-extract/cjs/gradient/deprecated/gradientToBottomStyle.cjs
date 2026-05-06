'use strict';

var gradientStopsFadeDark = require('../../tokens/dist/esm/gradient/gradientStopsFadeDark.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use background: `linear-gradient(to bottom, ${gradientStopsFadeDark});` instead  */
const gradientToBottomStyle = {
    background: `linear-gradient(to bottom, ${gradientStopsFadeDark.gradientStopsFadeDark});`,
};

exports.gradientToBottomStyle = gradientToBottomStyle;
