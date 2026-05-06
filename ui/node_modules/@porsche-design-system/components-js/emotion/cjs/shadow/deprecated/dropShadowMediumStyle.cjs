'use strict';

var shadowMd = require('../../tokens/dist/esm/shadow/shadowMd.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use boxShadow: shadowMd instead. */
const dropShadowMediumStyle = {
    boxShadow: shadowMd.shadowMd,
};

exports.dropShadowMediumStyle = dropShadowMediumStyle;
