'use strict';

var shadowLg = require('../../tokens/dist/esm/shadow/shadowLg.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use boxShadow: shadowLg instead. */
const dropShadowHighStyle = {
    boxShadow: shadowLg.shadowLg,
};

exports.dropShadowHighStyle = dropShadowHighStyle;
