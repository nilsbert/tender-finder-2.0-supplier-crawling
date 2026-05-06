'use strict';

var themeDark = require('./themeDark.cjs');
var themeLight = require('./themeLight.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use individual variables instead. */
const theme = {
    light: themeLight.themeLight,
    dark: themeDark.themeDark,
};

exports.theme = theme;
