'use strict';

var shadowSm = require('../../tokens/dist/esm/shadow/shadowSm.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use boxShadow: shadowSm instead. */
const dropShadowLowStyle = {
    boxShadow: shadowSm.shadowSm,
};

exports.dropShadowLowStyle = dropShadowLowStyle;
